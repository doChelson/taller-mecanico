package com.example.signin.service;

import com.example.signin.model.Cliente;
import com.example.signin.model.Vehiculo;
import com.example.signin.repository.ClienteRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {
    private final ClienteRepository clienteRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final ReservaRepository reservaRepository;

    public ClienteService(ClienteRepository clienteRepository,
                          OrdenTrabajoRepository ordenTrabajoRepository,
                          ReservaRepository reservaRepository) {
        this.clienteRepository = clienteRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.reservaRepository = reservaRepository;
    }

    public Cliente crearCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Optional<Cliente> obtenerClientePorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public List<Cliente> obtenerTodosClientes() {
        return clienteRepository.findAll();
    }

    public Cliente actualizarCliente(Integer id, Cliente clienteActualizado) {
        return clienteRepository.findById(id).map(cliente -> {
            cliente.setNombre(clienteActualizado.getNombre());
            cliente.setTelefono(clienteActualizado.getTelefono());
            cliente.setDireccion(clienteActualizado.getDireccion());
            return clienteRepository.save(cliente);
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public void eliminarCliente(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));

        // 1. Borrar órdenes y reservas asociadas a cada vehículo del cliente
        for (Vehiculo vehiculo : cliente.getVehiculos()) {
            ordenTrabajoRepository.deleteAll(
                ordenTrabajoRepository.findByVehiculoId(vehiculo.getId())
            );
            reservaRepository.deleteAll(
                reservaRepository.findByVehiculoId(vehiculo.getId())
            );
        }

        // 2. Borrar reservas directas del cliente
        reservaRepository.deleteAll(
            reservaRepository.findByClienteId(id)
        );

        // 3. Borrar el cliente (cascade elimina sus vehículos)
        clienteRepository.deleteById(id);
    }

    public Optional<Cliente> obtenerClientePorRut(String rut) {
        return clienteRepository.findByRut(rut);
    }

    public Optional<Cliente> obtenerClientePorEmail(String email) {
        return clienteRepository.findByEmail(email);
    }
}
