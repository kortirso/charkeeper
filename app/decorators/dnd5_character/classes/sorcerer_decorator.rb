# frozen_string_literal: true

module Dnd5Character
  module Classes
    class SorcererDecorator
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff dart dagger sling light_crossbow].freeze

      def decorate_fresh_character(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)

        result
      end

      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[con cha] if result[:main_class] == 'sorcerer'
        result[:spell_classes][:sorcerer] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          cantrips_amount: cantrips_amount(class_level),
          spells_amount: spells_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)

        if class_level >= 2 # Sorcery Points, 2 level
          result[:class_features] << {
            slug: 'sorcery_points',
            title: I18n.t('dnd5.class_features.sorcerer.sorcery_points.title'),
            description: I18n.t('dnd5.class_features.sorcerer.sorcery_points.description'),
            limit: class_level
          }
        end
        if class_level >= 2 # Creating Spell Slots, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.sorcerer.creating_spell_slots.title'),
            description: I18n.t('dnd5.class_features.sorcerer.creating_spell_slots.description')
          }
        end
        if class_level >= 2 # Converting a Spell Slot, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.sorcerer.converting_spell_slot.title'),
            description: I18n.t('dnd5.class_features.sorcerer.converting_spell_slot.description')
          }
        end

        result[:selected_features].each do |feature_slug, options|
          next if feature_slug == 'draconic_ancestry'

          options.each { |option| send(:"#{feature_slug}_#{option}", result) }
        end

        result
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity

      private

      def cantrips_amount(class_level)
        return 6 if class_level >= 10
        return 5 if class_level >= 4

        4
      end

      def spells_amount(class_level)
        return 15 if class_level >= 17
        return 14 if class_level >= 15
        return 13 if class_level >= 13
        return 12 if class_level >= 11

        class_level + 1
      end

      def max_spell_level(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      def metamagic_careful_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_careful_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_careful_spell.description')
        }
      end

      def metamagic_distant_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_distant_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_distant_spell.description')
        }
      end

      def metamagic_empowered_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_empowered_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_empowered_spell.description')
        }
      end

      def metamagic_extended_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_extended_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_extended_spell.description')
        }
      end

      def metamagic_heightened_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_heightened_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_heightened_spell.description')
        }
      end

      def metamagic_quickened_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_quickened_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_quickened_spell.description')
        }
      end

      def metamagic_subtle_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_subtle_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_subtle_spell.description')
        }
      end

      def metamagic_twinned_spell(result)
        result[:class_features] << {
          title: I18n.t('dnd5.class_features.sorcerer.metamagic_twinned_spell.title'),
          description: I18n.t('dnd5.class_features.sorcerer.metamagic_twinned_spell.description')
        }
      end
    end
  end
end
