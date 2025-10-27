# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CircleOfTheLandDecorator < ApplicationDecorator
      LAND_SPELLS_3 = {
        'arid' => %w[blur burning_hands fire_bolt],
        'polar' => %w[fog_cloud hold_person ray_of_frost],
        'temperate' => %w[misty_step shocking_grasp sleep],
        'tropical' => %w[acid_splash ray_of_sickness web]
      }.freeze
      LAND_SPELLS_5 = {
        'arid' => %w[fireball],
        'polar' => %w[sleet_storm],
        'temperate' => %w[lightning_bolt],
        'tropical' => %w[stinking_cloud]
      }.freeze
      LAND_SPELLS_7 = {
        'arid' => %w[blight],
        'polar' => %w[ice_storm],
        'temperate' => %w[freedom_of_movement],
        'tropical' => %w[polymorph]
      }.freeze
      LAND_SPELLS_9 = {
        'arid' => %w[wall_of_stone],
        'polar' => %w[cone_of_cold],
        'temperate' => %w[tree_stride],
        'tropical' => %w[insect_plague]
      }.freeze

      def static_spells # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
        @static_spells ||= begin
          selected_land = selected_feats['circle_of_the_land_spells']
          result = __getobj__.static_spells
          result.merge!(LAND_SPELLS_3[selected_land].index_with { static_spell_attributes }) if selected_land && class_level >= 3
          result.merge!(LAND_SPELLS_5[selected_land].index_with { static_spell_attributes }) if selected_land && class_level >= 5
          result.merge!(LAND_SPELLS_7[selected_land].index_with { static_spell_attributes }) if selected_land && class_level >= 7
          result.merge!(LAND_SPELLS_9[selected_land].index_with { static_spell_attributes }) if selected_land && class_level >= 9
          result
        end
      end

      private

      def class_level
        classes['druid']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
