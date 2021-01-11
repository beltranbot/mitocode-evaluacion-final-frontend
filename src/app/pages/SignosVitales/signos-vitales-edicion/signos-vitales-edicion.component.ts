import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Paciente } from 'src/app/_model/paciente';
import { Signo } from 'src/app/_model/SIgno';
import { PacienteService } from 'src/app/_service/paciente.service';
import { SignosVitalesService } from 'src/app/_service/signoVitales.service';
import * as moment from 'moment';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signos-vitales-edicion',
  templateUrl: './signos-vitales-edicion.component.html',
  styleUrls: ['./signos-vitales-edicion.component.css'],
})
export class SignosVitalesEdicionComponent implements OnInit {
  pacientes: Paciente[];
  pacientes$: Observable<Paciente[]>;
  form: FormGroup;
  id: number;
  idPacienteSeleccionado: number;
  maxFecha: Date = new Date();
  edicion: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signosVitalesService: SignosVitalesService,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.pacientes$ = this.pacienteService.listar();
    this.form = new FormGroup({
      id: new FormControl(0),
      paciente: new FormControl(0),
      fecha: new FormControl(new Date()),
      temperatura: new FormControl(''),
      pulso: new FormControl(''),
      ritmoRespiratorio: new FormControl(''),
    });

    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.initForm();
    });
  }

  private initForm() {
    if (this.edicion) {
      this.signosVitalesService.listarPorId(this.id).subscribe((data) => {
        this.form = new FormGroup({
          id: new FormControl(data.idSigno),
          idPaciente: new FormControl(data.paciente.idPaciente),
          fecha: new FormControl(new Date(data.fecha)),
          temperatura: new FormControl(data.temperatura),
          pulso: new FormControl(data.pulso),
          ritmoRespiratorio: new FormControl(data.ritmoRespiratorio),
        });
        this.idPacienteSeleccionado = data.paciente.idPaciente;
      });
    }
  }

  operar() {
    let signo = new Signo();
    let paciente = new Paciente();
    signo.idSigno = this.id;
    paciente.idPaciente = this.idPacienteSeleccionado;
    signo.paciente = paciente;
    signo.fecha = moment(this.form.value['fecha']).format('YYYY-MM-DDTHH:mm:ss');
    signo.temperatura = this.form.value['temperatura'];
    signo.pulso = this.form.value['pulso'];
    signo.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];

    if (this.edicion) {
      this.signosVitalesService
        .modificar(signo)
        .pipe(
          switchMap(() => {
            return this.signosVitalesService.listar();
          })
        )
        .subscribe((data) => {
          this.signosVitalesService.setSignoCambio(data);
          this.signosVitalesService.setMensajeCambio('SE MODIFICO');
        });
    } else {
      this.signosVitalesService.registrar(signo).subscribe(() => {
        this.signosVitalesService.listar().subscribe((data) => {
          this.signosVitalesService.setSignoCambio(data);
          this.signosVitalesService.setMensajeCambio('SE REGISTRO');
        });
      });
    }

    this.router.navigate(['signos-vitales']);
  }
}
