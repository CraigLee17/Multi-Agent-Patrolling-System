package action;

/**
 * Created by Zhiyuan Li on 2017/2/2.
 */

import java.io.Serializable;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;

public class CreateMapAction extends ActionSupport implements Serializable {
    public String createMap() {
        ActionContext.getContext().put("Hello","Hello idea");
        return "createMap";
    }
}
