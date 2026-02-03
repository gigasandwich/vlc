export type PointType = 'circle' | 'square' | 'triangle'

export interface BackendPointData {
  id: number
  date: string
  surface: number
  budget: number
  coordinates: [number, number]
  point_type_label: string
  point_state_label: string
  factories: string[]
  assigned_user: string
}

export interface MapPoint {
  id: number
  lat: number
  lng: number
  type: PointType
  backendData: BackendPointData
}
