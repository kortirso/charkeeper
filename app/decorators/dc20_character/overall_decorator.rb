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

    # rubocop: disable Layout/LineLength, Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    # {"poison" => {abs: 0, multi: 2}, "fire" => {abs: 0, multi: 1}, "cold" => {abs: 0, multi: 1}, "lightning" => {abs: 0, multi: 1}, "corrosion" => {abs: 0, multi: 1}, "bludge" => {abs: 0, multi: 1}, "pierce" => {abs: 0, multi: 1}, "slash" => {abs: 0, multi: 1}}
    def damages
      # [["poison", "resist", "half"], ["elemental", "resist", "half"], ["physical", "resist", "half"]]
      stack_damages(
        transform_categories(__getobj__.damages).group_by { |item| item[0] }.transform_values { |value| value.map { |item| item[1..] } }
      )
    end

    private

    # [["poison", "resist", "half"], ["elemental", "resist", "half"], ["physical", "resist", "half"]]
    def transform_categories(values)
      values.flat_map do |value|
        next [value[1..].unshift('bludge'), value[1..].unshift('pierce'), value[1..].unshift('slash')] if value[0] == 'physical'
        next [value[1..].unshift('fire'), value[1..].unshift('cold'), value[1..].unshift('lightning'), value[1..].unshift('poison'), value[1..].unshift('corrosion')] if value[0] == 'elemental'
        next [value[1..].unshift('psychic'), value[1..].unshift('radiant'), value[1..].unshift('umbral')] if value[0] == 'mystical'

        [value]
      end
    end

    # {"poison" => [["resist", "half"], ["resist", "half"]], "fire" => [["resist", "half"]], "cold" => [["resist", "half"]], "lightning" => [["resist", "half"]], "corrosion" => [["resist", "half"]], "bludge" => [["resist", "half"]], "pierce" => [["resist", "half"]], "slash" => [["resist", "half"]]}
    def stack_damages(hash)
      hash.transform_values do |values|
        abs_resist, values = values.partition { |item| item[0] == 'resist' && item[1] != 'half' }
        abs_vulner, values = values.partition { |item| item[0] == 'vulner' && item[1] != 'double' }
        multi_resist, values = values.partition { |item| item[0] == 'resist' && item[1] == 'half' }
        multi_vulner, values = values.partition { |item| item[0] == 'vulner' && item[1] == 'double' }
        immune = values.select { |item| item[0] == 'immune' }
        next { immune: true } if immune.any?

        abs_resist_transforms = (abs_resist.size / 2)
        abs_resist.sort_by { |i| i[1] }.shift(abs_resist_transforms * 2)
        abs_resist_transforms.times { multi_resist.unshift(%w[resist half]) }

        abs_vulner_transforms = (abs_vulner.size / 2)
        abs_vulner.sort_by { |i| i[1] }.shift(abs_vulner_transforms * 2)
        abs_vulner_transforms.times { multi_vulner.unshift(%w[vulner double]) }

        {
          abs: abs_resist.dig(0, 1).to_i - abs_vulner.dig(0, 1).to_i,
          multi: multi_resist.size - multi_vulner.size
        }
      end
    end
    # rubocop: enable Layout/LineLength, Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
