# frozen_string_literal: true

module Dnd5Character
  module Classes
    class MonkDecorator
      NOT_MONK_WEAPON_CAPTIONS = %w[2handed heavy].freeze

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/MethodLength
      def decorate(result:, class_level:)
        ki_dc = 8 + result[:proficiency_bonus] + result.dig(:modifiers, :wis)
        result[:class_save_dc] = %i[str dex] if result[:main_class] == 'monk'

        no_armor = result[:defense_gear].values.all?(&:nil?)
        result[:combat][:speed] += speed_modifier(class_level) if no_armor
        result[:combat][:armor_class] = [result[:combat][:armor_class], monk_armor_class(result)].max if no_armor

        martial_arts(result, class_level) if no_armor # Martial arts, 1 level
        if class_level >= 2 # Flurry of Blows, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.flurry_of_blows.title'),
            description: I18n.t('dnd5.class_features.monk.flurry_of_blows.description')
          }
        end
        if class_level >= 2 # Patient Defense, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.patient_defense.title'),
            description: I18n.t('dnd5.class_features.monk.patient_defense.description')
          }
        end
        if class_level >= 2 # Step of the Wind, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.step_of_the_wind.title'),
            description: I18n.t('dnd5.class_features.monk.step_of_the_wind.description')
          }
        end
        if class_level >= 3 # Deflect Missiles, 3 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.deflect_missiles.title'),
            description: I18n.t(
              'dnd5.class_features.monk.deflect_missiles.description',
              value: "1d10+#{result.dig(:modifiers, :dex) + class_level}"
            )
          }
        end
        if class_level >= 4 # Slow Fall, 4 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.slow_fall.title'),
            description: I18n.t('dnd5.class_features.monk.slow_fall.description', value: class_level * 5)
          }
        end
        result[:combat][:attacks_per_action] = 2 if class_level >= 5 # Extra Attack, 5 level
        if class_level >= 5 # Stunning Strike, 5 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.stunning_strike.title'),
            description: I18n.t('dnd5.class_features.monk.stunning_strike.description', value: ki_dc)
          }
        end
        if class_level >= 6 # Ki-Empowered Strikes, 6 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.empowered_strikes.title'),
            description: I18n.t('dnd5.class_features.monk.empowered_strikes.description')
          }
        end
        if class_level >= 7 # Evasion, 7 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.evasion.title'),
            description: I18n.t('dnd5.class_features.monk.evasion.description')
          }
        end
        if class_level >= 7 # Stillness of Mind, 7 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.stillness_of_mind.title'),
            description: I18n.t('dnd5.class_features.monk.stillness_of_mind.description')
          }
        end
        if class_level >= 9 # Unarmored Movement, 9 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.monk.unarmored_movement.title'),
            description: I18n.t('dnd5.class_features.monk.unarmored_movement.description')
          }
        end
        result[:immunities] += %w[poison disease] if class_level >= 10 # Purity of Body, 10 level

        result
      end

      private

      def speed_modifier(class_level)
        return 0 if class_level < 2

        (((class_level + 2) / 4) + 1) * 5
      end

      def monk_armor_class(result)
        10 + result.dig(:modifiers, :dex) + result.dig(:modifiers, :wis)
      end

      def martial_arts(result, class_level)
        key_ability_bonus = [result.dig(:modifiers, :str), result.dig(:modifiers, :dex)].max

        result[:attacks].each do |attack|
          next if attack[:caption].any? { |item| NOT_MONK_WEAPON_CAPTIONS.include?(item) }
          next if attack[:kind] == 'martial' && attack.dig(:name, :en) != 'Shortsword'

          attack[:attack_bonus] = key_ability_bonus + result[:proficiency_bonus]
          attack[:damage_bonus] = key_ability_bonus if attack[:action_type] == 'action'
          attack[:damage] = "1d#{(((class_level + 1) / 6) + 2) * 2}" if attack[:kind] == 'unarmed'
        end
        unarmed_attack = result[:attacks].find { |attack| attack[:kind] == 'unarmed' && attack[:action_type] == 'action' }
        result[:attacks] << unarmed_attack.merge({ action_type: 'bonus action', tooltips: ['flurry_of_blows'] })
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/MethodLength
    end
  end
end
