import type { DiagnosisResult } from '../types';

let _result: DiagnosisResult | null = null;
let _selectedBikeId: string | null = null;

export function setDiagnosisResult(result: DiagnosisResult): void {
  _result = result;
}

export function getDiagnosisResult(): DiagnosisResult | null {
  return _result;
}

export function setDiagnosisBike(bikeId: string): void {
  _selectedBikeId = bikeId;
}

export function getDiagnosisBike(): string | null {
  return _selectedBikeId;
}
