
package com.example.DXC.service.observer;
import com.example.DXC.model.Alert;
import com.example.DXC.model.User;

public interface AlertObserver {
    void notify(Alert alert, User user);
}