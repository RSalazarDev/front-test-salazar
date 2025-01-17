import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import axios from 'axios';
import { Candidate } from './candidate';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MatButtonModule,MatFormFieldModule,MatInputModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss'],
})
export class CandidatesComponent implements OnInit {
  name = new FormControl('',Validators.required);
  surname = new FormControl('',Validators.required);
  excelFile: File | null = null;
  apiUrl = 'http://localhost:3000/candidates';
  candidates: Candidate[] = [];

  ngOnInit(): void {
    this.loadCandidatesFromStorage();
  }

  loadCandidatesFromStorage(): void {
    const storedCandidates = localStorage.getItem('candidates');
    this.candidates = storedCandidates ? JSON.parse(storedCandidates) : [];
  }

  saveCandidatesToStorage(): void {
    localStorage.setItem('candidates', JSON.stringify(this.candidates));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

      if (allowedTypes.includes(file.type)) {
        this.excelFile = file;
      } else {
        alert('Invalid file type. Please select an Excel file (.xls or .xlsx).');
        input.value = '';
        this.excelFile = null;
      }
    }
  }

  onSubmit(): void {
    if (!this.excelFile) {
      alert('Please select a file.');
      return;
    }

    if (this.name.invalid || this.surname.invalid) {
      alert('Please fill out all required fields.');
      return;
    }  

    const formData = new FormData();
    formData.append('name', this.name.value || '');
    formData.append('surname', this.surname.value || '');
    formData.append('excel', this.excelFile);

    axios
      .post(this.apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        alert('Candidate was added successfully');
        this.addNewCandidate(response.data.data.extractedData[0]);
        this.resetForm();
      })
      .catch((error) => {
        console.error('There was an error:', error);
        alert('Error adding a candidate');
      });
  }

  addNewCandidate(extractedData: any): void {
    const newCandidate: Candidate = {
      //id: Date.now(), Identifier we dont require now, but we should use for real scenarios
      name: this.name.value || '',
      surname: this.surname.value || '',
      seniority: extractedData?.Seniority || null,
      experience: extractedData?.Experience || '',
      availability: extractedData?.Availability || '',
    };

    this.candidates.push(newCandidate);
    this.saveCandidatesToStorage();
  }

  //Clears all fields after submitting a candidate.
  resetForm(): void {
    this.name.reset();
    this.surname.reset();
    this.excelFile = null;
  
    // Reset the file input field
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }
  }
}
