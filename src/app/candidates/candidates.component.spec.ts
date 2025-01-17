import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CandidatesComponent } from './candidates.component';
import axios from 'axios';
import { Candidate } from './candidate';

jest.mock('axios'); // Mock axios

describe('CandidatesComponent', () => {
  let component: CandidatesComponent;
  let fixture: ComponentFixture<CandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatesComponent], // Use standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit candidate data and handle success', async () => {
    const mockResponse = {
      data: {
        data: {
          extractedData: [{ Seniority: 'Junior', Experience: 2, Availability: 'False' }],
        },
      },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    const resetFormSpy = jest.spyOn(component, 'resetForm');

    component.name.setValue('John');
    component.surname.setValue('Doe');
    component.excelFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await component.onSubmit();

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/candidates',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(component.candidates.length).toBe(1);
    expect(component.candidates[0]).toEqual(
      expect.objectContaining({
        name: 'John',
        surname: 'Doe',
        seniority: 'Junior',
        experience: 2,
        availability: 'False',
      } as unknown as Candidate),  // Type cast to Candidate interface for validation
    );
    expect(alertSpy).toHaveBeenCalledWith('Candidate was added successfully');
    expect(resetFormSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
    resetFormSpy.mockRestore();
  });

  it('should load candidates from localStorage', () => {
    const mockCandidates: Candidate[] = [{ name: 'John', surname: 'Doe', seniority: 'Junior', experience: 2, availability: true}];
    localStorage.setItem('candidates', JSON.stringify(mockCandidates));

    component.loadCandidatesFromStorage();

    expect(component.candidates).toEqual(mockCandidates);
  });

  it('should handle file selection correctly', () => {
    const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const event = {
      target: { files: [mockFile] },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.excelFile).toEqual(mockFile);
  });

  it('should reject invalid file types', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = {
      target: { files: [mockFile] },
    } as unknown as Event;

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    component.onFileSelected(event);

    expect(alertSpy).toHaveBeenCalledWith('Invalid file type. Please select an Excel file (.xls or .xlsx).');
    expect(component.excelFile).toBeNull();

    alertSpy.mockRestore();
  });

  it('should save candidates to localStorage', () => {
    const mockCandidates: Candidate[] = [{ name: 'Jane', surname: 'Doe', seniority: 'Senior', experience: 5, availability: true}];
    component.candidates = mockCandidates;

    component.saveCandidatesToStorage();

    const storedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    expect(storedCandidates).toEqual(mockCandidates);
  });

  it('should handle submission error', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    component.name.setValue('John');
    component.surname.setValue('Doe');
    component.excelFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith('Error adding a candidate');

    alertSpy.mockRestore();
  });
});
