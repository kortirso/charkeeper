# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ArtificerDecorator
      include ActionView::Helpers::SanitizeHelper

      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze
      SPELL_SLOTS = {
        1 => { 1 => 2 },
        2 => { 1 => 2 },
        3 => { 1 => 3 },
        4 => { 1 => 3 },
        5 => { 1 => 4, 2 => 2 },
        6 => { 1 => 4, 2 => 2 },
        7 => { 1 => 4, 2 => 3 },
        8 => { 1 => 4, 2 => 3 },
        9 => { 1 => 4, 2 => 3, 3 => 2 },
        10 => { 1 => 4, 2 => 3, 3 => 2 },
        11 => { 1 => 4, 2 => 3, 3 => 3 },
        12 => { 1 => 4, 2 => 3, 3 => 3 },
        13 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        14 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        15 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        16 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        17 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        18 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        19 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 },
        20 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 }
      }.freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end

      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[con int] if result[:main_class] == 'artificer'
        result[:spell_classes][:artificer] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :int),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :int),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: [result.dig(:modifiers, :int) + (class_level / 2), 1].max
        }
        result[:spells_slots] = spells_slots(class_level)

        result[:class_features] << {
          slug: 'magical_tinkering',
          title: I18n.t('dnd5.class_features.artificer.magical_tinkering.title'),
          description: I18n.t('dnd5.class_features.artificer.magical_tinkering.description'),
          limit: [result.dig(:modifiers, :int), 1].max
        }
        if class_level >= 3 # The Right Tool for the Job, 3 level
          result[:class_features] << {
            slug: 'the_right_tool_for_the_job',
            title: I18n.t('dnd5.class_features.artificer.the_right_tool_for_the_job.title'),
            description: I18n.t('dnd5.class_features.artificer.the_right_tool_for_the_job.description')
          }
        end

        result[:selected_features].each do |feature_slug, options|
          next infuse_item(options, result) if feature_slug == 'infuse_item'

          options.each { |option| send(:"#{feature_slug}_#{option}", result) }
        end

        result
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 14
        return 3 if class_level >= 10

        2
      end

      def max_spell_level(class_level)
        SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        SPELL_SLOTS[class_level]
      end

      def infuse_item(value, result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.artificer.infuse_item.title'),
          description: sanitize(value.split("\n").join('<br />'))
        }
      end
    end
  end
end
