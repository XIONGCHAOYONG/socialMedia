package com.x.mapper;

import com.x.pojo.dto.UserRegisterDTO;
import com.x.pojo.dto.UserUpdateDTO;
import com.x.pojo.entity.User;
import com.x.pojo.vo.UserRecommendVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserMapper {
    @Select("select * from user where account=#{account}")
    User getByAccount(String account);

    @Insert("insert into user (account,password,username)  " +
            "values (#{account},#{password},#{username})")
    void register(UserRegisterDTO userRegisterDto);
    @Select("select * from user where id=#{id}")
    User getById(Long id);

    void update(User user);


    @Select("select * from user")
    List<User> getAllUsers();

    @Update("update user set status=0 where id=#{id}")
    void blockUser(Long id);

    @Update("update user set status=1 where id= #{id}")
    void recoverUser(Long id);

    List<Long> getUserGrowthData();

    @Select("select count(*) from user")
    Long getUserTotal();


    Long getUserTodayAdd();


    List<User> getByIds(List<Long> userIds);

    @Update("update  user set admin=1 where id=#{id}")
    void setAdmin(Long id);
}
