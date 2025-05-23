# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class CircleOfTheLandDecorator < ApplicationDecorator
      LAND_SPELLS_3 = {
        'arctic' => %w[hold_person spike_growth],
        'coast' => %w[mirror_image misty_step],
        'desert' => %w[blur silence],
        'forest' => %w[barkskin spider_climb],
        'grassland' => %w[invisibility pass_without_trace],
        'mountain' => %w[spider_climb spike_growth],
        'swamp' => %w[darkness melf_acid_arrow],
        'underdark' => %w[spider_climb web]
      }.freeze
      LAND_SPELLS_5 = {
        'arctic' => %w[sleet_storm slow],
        'coast' => %w[water_breathing water_walk],
        'desert' => %w[create_food_and_water protection_from_energy],
        'forest' => %w[call_lightning plant_growth],
        'grassland' => %w[daylight haste],
        'mountain' => %w[lightning_bolt meld_into_stone],
        'swamp' => %w[water_walk stinking_cloud],
        'underdark' => %w[gaseous_form stinking_cloud]
      }.freeze

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:druid][:cantrips_amount] += 1 if class_level >= 2
          result
        end
      end

      def static_spells
        @static_spells ||= begin
          selected_land = selected_features['land']
          result = __getobj__.static_spells
          result.merge!(LAND_SPELLS_3[selected_land].index_with { {} }) if selected_land && class_level >= 3
          result.merge!(LAND_SPELLS_5[selected_land].index_with { {} }) if selected_land && class_level >= 5
          result
        end
      end

      private

      def class_level
        @class_level ||= classes['druid']
      end
    end
  end
end
