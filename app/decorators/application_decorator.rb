# frozen_string_literal: true

class ApplicationDecorator < SimpleDelegator
  attr_accessor :logger

  def initialize(service)
    super
    @logger = Logger.new($stdout)
  end

  def method_missing(method, *_args)
    if instance_variable_defined?(:"@#{method}")
      instance_variable_get(:"@#{method}")
    else
      instance_variable_set(:"@#{method}", __getobj__.public_send(method))
    end
  end
end
