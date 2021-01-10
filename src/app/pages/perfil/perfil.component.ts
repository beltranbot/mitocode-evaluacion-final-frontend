import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: string;
  roles: string[];

  constructor() { }

  ngOnInit(): void {
    const helper = new JwtHelperService();
    let token = helper.decodeToken(sessionStorage.getItem(environment.TOKEN_NAME));
    this.usuario = token.user_name;
    this.roles = token.authorities;
  }

}
