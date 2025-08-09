package com.x.controller.admin;

import com.x.pojo.dto.UserLoginDTO;
import com.x.pojo.entity.User;
import com.x.service.UserService;
import com.x.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/user")
@RestController
@CrossOrigin
@Controller("adminUserController")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result adminLogin(@RequestBody UserLoginDTO userLoginDTO){
        userService.adminLogin(userLoginDTO);
        return Result.success();
    }

    @GetMapping("/get")
    public Result<List<User>> getAllUsers(){
        // 实现获取所有用户逻辑
        List<User> users = userService.getAllUsers();
        return Result.success(users);
    }
    @DeleteMapping("/block/{id}")
    public Result blockUser(@PathVariable Long id){
        // 实现封禁用户逻辑
        userService.blockUser(id);
        return Result.success();
    }

    @PutMapping("/recover/{id}")
    public Result recoverUser(@PathVariable Long id){
        // 实现解封用户逻辑
        userService.recoverUser(id);
        return Result.success();
    }
    @PutMapping("setAdmin/{id}")
    public Result setAdmin(@PathVariable Long id){
        userService.setAdmin(id);
        return Result.success();
    }
}