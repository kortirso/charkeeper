# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :heritage, :main_class, :classes, :level, :traits, to: :data

    def method_missing(_method, *args); end
  end
end
