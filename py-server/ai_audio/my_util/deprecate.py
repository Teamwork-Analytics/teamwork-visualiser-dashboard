

def deprecated(func):
    def wrap_func(*args, **kwargs):
        print(f'===== Function {func.__name__!r} is deprecated')
        return func(*args, **kwargs)

    return wrap_func
