# frozen_string_literal: true

class ApplicationDecorator < SimpleDelegator
  def method_missing(method, *_args)
    __getobj__.public_send(method)
  end
end
