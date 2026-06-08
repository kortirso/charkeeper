# frozen_string_literal: true

module Daggerheart
  class CompanionDecorator < ApplicationDecoratorV2
    def call(companion:)
      @companion = companion
      @result = companion.data.attributes

      generate_basis
      apply_add_modifiers

      self
    end

    private

    def generate_basis
      @result['evasion'] = evasion + (leveling['aware'].to_i * 2)
      @result['stress_max'] = stress_max + leveling['resilient'].to_i
      @result['damage_bonus'] = 0
    end

    def apply_add_modifiers # rubocop: disable Metrics/AbcSize
      res = object_modifiers.flat_map do |items|
        items.filter_map { |key, value| { key => value['value'] } }
      end.compact_blank.each_with_object({}) do |value, acc|
        key = value.keys[0]
        acc[key] ||= []
        formula_result = formula.call(formula: value[key], variables: formula_variables)
        formula_result ? (acc[key] << formula_result) : monitoring_formula_error(formula)
      end

      res.each do |(key_name, values)|
        values.each do |value|
          @result[key_name] = @result[key_name] + value
        end
      end
    end

    def formula_variables
      @formula_variables ||= { level: level }
    end

    def object_modifiers
      @object_modifiers ||= @companion.bonuses.where(enabled: true).pluck(:value).flatten
    end
  end
end
