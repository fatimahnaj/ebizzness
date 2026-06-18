package com.ebizzness.ecommerce.util;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.User;

public final class AccountStatusUtil {

    private AccountStatusUtil() {
    }

    public static boolean isBanned(User user) {
        if (user instanceof Buyer buyer) {
            return buyer.isBanned();
        }

        if (user instanceof Seller seller) {
            return seller.isBanned();
        }

        return false;
    }
}
