# frozen_string_literal: true

module Dc20Character
  class OverallDecorator < ApplicationDecorator
    def health
      @health ||= __getobj__.health.merge(
        'max' => max_health,
        'bloodied' => max_health / 2,
        'well_bloodied' => max_health / 4
      )
    end

    def speeds
      @speeds ||= __getobj__.speeds.transform_values { |item| item.nil? ? __getobj__.speeds['ground'] : item }
    end

    def rest_points
      @rest_points ||= __getobj__.rest_points.merge('max' => health['max'])
    end

    def max_health
      @max_health ||= __getobj__.max_health + sum(__getobj__.bonuses.pluck('hp')) + sum(__getobj__.dynamic_bonuses.pluck('hp'))
    end

    private

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
