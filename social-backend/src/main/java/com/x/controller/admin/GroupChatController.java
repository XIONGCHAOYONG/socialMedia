package com.x.controller.admin;

import com.x.pojo.vo.GroupChatMemberVO;
import com.x.pojo.vo.GroupVO;
import com.x.service.GroupChatSerivice;
import com.x.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/group")
@RestController
@CrossOrigin
@Controller("adminGroupChatController")
public class GroupChatController {
    @Autowired
    private GroupChatSerivice groupChatService;
    @GetMapping("/get")
    public Result<List<GroupVO>> getMyCreatedGroups(){
        List<GroupVO> list = groupChatService.getAll();
        return Result.success(list);
    }

    @GetMapping("/getMembers/{id}")
    public Result<List<GroupChatMemberVO>> getGroupMembers(@PathVariable Long id){
        List<GroupChatMemberVO> list = groupChatService.getGroupMembers(id);
        return Result.success(list);
    }

    @DeleteMapping("delete/{id}")
    public Result<String> deleteGroup(@PathVariable Long id){
        groupChatService.dissolveGroup(id);
        return Result.success("删除成功");
    }
}
