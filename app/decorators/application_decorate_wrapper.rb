# frozen_string_literal: true

class ApplicationDecorateWrapper
  attr_accessor :wrapped, :logger

  def initialize(obj)
    @wrapped = wrap_classes(obj)
    @logger = Logger.new($stdout)
  end

  def method_missing(method, *_args)
    if instance_variable_defined?(:"@#{method}")
      instance_variable_get(:"@#{method}")
    else
      instance_variable_set(:"@#{method}", wrapped.public_send(method))
    end
  end

  private

  def wrap_classes = raise NotImplementedError
end
