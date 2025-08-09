package com.x.controller.admin;

import com.x.mapper.GroupChatMapper;
import com.x.mapper.PostMapper;
import com.x.mapper.UserMapper;
import com.x.pojo.vo.CountsVO;
import com.x.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/common")
@RestController
@CrossOrigin
@Controller("adminCommonController")
public class CommonController {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private GroupChatMapper groupChatMapper;
    @Autowired
    private PostMapper postMapper;

    @GetMapping("/getCounts")
    public Result<CountsVO> getCounts(){
        CountsVO countsVO=new CountsVO();
        List<Long> userGrowthData = userMapper.getUserGrowthData();
        if(userGrowthData.size()<7){
            for(int i=userGrowthData.size();i<7;i++)
                userGrowthData.add(0L);
        }
        countsVO.setUserGrowthData(userGrowthData);
        List<Long> postGrowthData = postMapper.getPostGrowthData();
        if(postGrowthData.size()<7){
            for(int i=postGrowthData.size();i<7;i++)
                postGrowthData.add(0L);
        }
        countsVO.setPostGrowthData(postGrowthData);
        countsVO.setUserTotal(userMapper.getUserTotal());
        countsVO.setUserTodayAdd(userMapper.getUserTodayAdd());
        countsVO.setGroupTotal(groupChatMapper.getGroupTotal());
        countsVO.setPostTotal(postMapper.getPostTotal());
        return Result.success(countsVO);
    }

}
