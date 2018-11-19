(function() {

    var lastScrollAt = Date.now(),
        timeout;

    function scrollStartStop() {
        var $this = $(this);

        if (Date.now() - lastScrollAt > 100)
            $this.trigger('scrollstart')

        lastScrollAt = Date.now();

        clearTimeout(timeout);

        timeout = setTimeout(function() {
            if (Date.now() - lastScrollAt > 99)
                $this.trigger('scrollend');
        }, 100);
    }

    $(document).on('scroll', scrollStartStop);

})()