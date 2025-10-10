# frozen_string_literal: true

module Dc20Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :abilities, :main_class, :level, :combat_expertise, :health, :classes, :attribute_points, :ancestries, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def modified_abilities
      @modified_abilities ||= abilities.merge('prime' => abilities.values.max)
    end
  end
end
