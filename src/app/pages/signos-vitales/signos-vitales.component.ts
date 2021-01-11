import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Signo } from 'src/app/_model/SIgno';
import { SignosVitalesService } from 'src/app/_service/signoVitales.service';

@Component({
  selector: 'app-signos-vitales',
  templateUrl: './signos-vitales.component.html',
  styleUrls: ['./signos-vitales.component.css'],
})
export class SignosVitalesComponent implements OnInit {
  displayedColumns = [
    'idSigno',
    'paciente',
    'fecha',
    'temperatura',
    'pulso',
    'ritmoRespiratorio',
    'acciones',
  ];
  dataSource: MatTableDataSource<Signo>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  cantidad: number = 0;

  constructor(
    public route: ActivatedRoute,
    private signosVitalesService: SignosVitalesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.signosVitalesService.listarPageable(0, 10).subscribe((data) => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });

    this.signosVitalesService.getSignoCambio().subscribe((data) => {
      this.crearTabla(data);
    });

    this.signosVitalesService.getMensajeCambio().subscribe((data) => {
      this.snackBar.open(data, 'AVISO', { duration: 2000 });
    });
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  eliminar(idSigno: number) {
    this.signosVitalesService
      .eliminar(idSigno)
      .pipe(
        switchMap(() => {
          return this.signosVitalesService.listar();
        })
      )
      .subscribe((data) => {
        this.signosVitalesService.setSignoCambio(data);
        this.signosVitalesService.setMensajeCambio('SE ELIMINO');
      });
  }

  crearTabla(data: Signo[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  mostrarMas(e: any) {
    console.log(e.pageIndex, e.pageSize);
    
    this.signosVitalesService
      .listarPageable(e.pageIndex, e.pageSize)
      .subscribe((data) => {
        this.cantidad = data.totalElements;
        this.dataSource = new MatTableDataSource(data.content);
        this.dataSource.sort = this.sort;
      });
  }
}
