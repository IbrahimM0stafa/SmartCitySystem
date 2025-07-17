
package com.example.dxc.service.observer;
import com.example.dxc.model.Alert;
import com.example.dxc.model.User;

public interface AlertObserver {
    void notify(Alert alert, User user);
}