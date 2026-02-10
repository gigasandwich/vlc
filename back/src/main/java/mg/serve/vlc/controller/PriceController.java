package mg.serve.vlc.controller;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.model.Config;
import mg.serve.vlc.util.RepositoryProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/prices")
public class PriceController {
    private static final Logger logger = LoggerFactory.getLogger(PriceController.class);
    private static final String PRICE_KEY = "PRICE";

    @GetMapping("/current")
    public ApiResponse getCurrentPrice() {
        try {
            List<Config> prices = RepositoryProvider.configRepository.findAll()
                    .stream()
                    .filter(c -> PRICE_KEY.equals(c.getKey()))
                    .collect(Collectors.toList());

            if (prices.isEmpty()) {
                return new ApiResponse("error", null, "No price found");
            }

            Config latest = prices.stream()
                    .max((a, b) -> a.getDate().compareTo(b.getDate()))
                    .orElse(null);

            if (latest == null) {
                return new ApiResponse("error", null, "No price found");
            }

            Double priceValue = Double.parseDouble(latest.getValue());
            Map<String, Object> currentPriceMap = new HashMap<>();
            currentPriceMap.put("price", priceValue);
            currentPriceMap.put("date", latest.getDate());
            return new ApiResponse("success", currentPriceMap, "Current price retrieved");
        } catch (Exception e) {
            logger.error("Error retrieving current price", e);
            return new ApiResponse("error", null, "Error: " + e.getMessage());
        }
    }

    public static Config getPriceAtDateOrThrow(LocalDateTime referenceDate) throws Exception {
        if (referenceDate == null) {
            throw new Exception("Reference date cannot be null");
        }
        
        List<Config> prices = RepositoryProvider.configRepository.findAll()
                .stream()
                .filter(c -> c.getKey() != null && c.getKey().equalsIgnoreCase("PRICE"))
                .collect(Collectors.toList());

        if (prices.isEmpty()) {
            throw new Exception("No price found in database");
        }

        // Find latest price on or before the reference date by sorting
        List<Config> validPrices = prices.stream()
                .filter(c -> c.getDate() != null && !c.getDate().isAfter(referenceDate))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());

        if (validPrices.isEmpty()) {
            throw new Exception("No price available for the specified date. The earliest price available is from " + 
                prices.stream()
                    .map(Config::getDate)
                    .min((a, b) -> a.compareTo(b))
                    .map(Object::toString)
                    .orElse("unknown"));
        }

        // Take the last one (latest date on or before reference date)
        Config priceAtDate = validPrices.get(validPrices.size() - 1);

        if (priceAtDate == null) {
            throw new Exception("No price found for the specified date");
        }

        return priceAtDate;
    }

    @GetMapping("/at")
    public ApiResponse getPriceAtDate(@RequestParam("date") String dateStr) {
        try {
            LocalDateTime referenceDate = LocalDateTime.parse(dateStr);
            Config priceAtDate = getPriceAtDateOrThrow(referenceDate);
            
            Double priceValue = Double.parseDouble(priceAtDate.getValue());
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("price", priceValue);
            resultMap.put("date", priceAtDate.getDate());
            return new ApiResponse("success", resultMap, "Price at date retrieved");
        } catch (Exception e) {
            logger.error("Error retrieving price at date", e);
            return new ApiResponse("error", null, "Error: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ApiResponse getPriceHistory() {
        try {
            List<Config> prices = RepositoryProvider.configRepository.findAll()
                    .stream()
                    .filter(c -> PRICE_KEY.equals(c.getKey()))
                    .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> history = prices.stream()
                    .map(c -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", c.getId());
                        map.put("price", Double.parseDouble(c.getValue()));
                        map.put("date", c.getDate());
                        return map;
                    })
                    .collect(Collectors.toList());

            return new ApiResponse("success", history, "Price history retrieved");
        } catch (Exception e) {
            logger.error("Error retrieving price history", e);
            return new ApiResponse("error", null, "Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse updatePrice(@RequestBody Map<String, Object> request) {
        try {
            Object priceObj = request.get("price");
            if (priceObj == null) {
                return new ApiResponse("error", null, "Price is required");
            }

            Double price = Double.parseDouble(priceObj.toString());

            Config config = new Config();
            config.setKey(PRICE_KEY);
            config.setValue(price.toString());
            config.setType("double");
            config.setDate(LocalDateTime.now());

            Config saved = RepositoryProvider.configRepository.save(config);
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("id", saved.getId());
            resultMap.put("price", price);
            resultMap.put("date", saved.getDate());
            return new ApiResponse("success", resultMap, "Price updated successfully");
        } catch (NumberFormatException e) {
            logger.error("Invalid price format", e);
            return new ApiResponse("error", null, "Invalid price format");
        } catch (Exception e) {
            logger.error("Error updating price", e);
            return new ApiResponse("error", null, "Error: " + e.getMessage());
        }
    }
}
