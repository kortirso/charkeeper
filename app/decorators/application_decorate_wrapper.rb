# frozen_string_literal: true

class ApplicationDecorateWrapper
  attr_accessor :wrapped

  def initialize(obj)
    @wrapped = wrap_classes(obj)
  end

  def method_missing(method)
    wrapped.public_send(method)
  end

  private

  def wrap_classes = raise NotImplementedError
end
