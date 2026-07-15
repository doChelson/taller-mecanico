package com.example.signin.config;

import com.example.signin.model.Empresa;
import com.example.signin.repository.EmpresaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Crea una empresa demo automáticamente la primera vez que arranca la app
 * (solo si la tabla empresa está vacía). Así el login funciona sin tener que
 * insertar datos a mano en la base de datos, tanto en local como en Azure.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final EmpresaRepository empresaRepository;

    public DataSeeder(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @Override
    public void run(String... args) {
        if (empresaRepository.count() == 0) {
            empresaRepository.save(new Empresa("AutoFix", "admin123", true));
            System.out.println(">>> Empresa demo creada -> usuario: AutoFix  clave: admin123");
        }
    }
}
