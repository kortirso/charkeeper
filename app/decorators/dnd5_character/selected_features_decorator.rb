# frozen_string_literal: true

module Dnd5Character
  class SelectedFeaturesDecorator
    include ActionView::Helpers::SanitizeHelper

    def decorate_character_abilities(result:)
      result[:selected_features].each do |feature_slug, options|
        next infuse_item(options, result) if feature_slug == 'infuse_item'
        next expertise_bonuses(options, result) if feature_slug == 'expertise'
        next if feature_slug == 'draconic_ancestry'

        options.each { |option| send(:"#{feature_slug}_#{option}", result) }
      end

      result
    end

    private

    # artificer
    def infuse_item(value, result)
      result[:class_features] << {
        title: I18n.t('dnd5.class_features.artificer.infuse_item.title'),
        description: sanitize(value.split("\n").join('<br />'))
      }
    end

    # bard
    def expertise_bonuses(options, result)
      result[:skills].each do |skill|
        next skill if options.exclude?(skill[:name])

        skill[:modifier] += result[:proficiency_bonus]
      end
    end

    # fighter
    def fighting_style_defense(result)
      result[:combat][:armor_class] += 1 if result.dig(:defense_gear, :armor).present?
    end

    def fighting_style_archery(result)
      result[:attacks].each do |attack|
        next if attack[:type] != 'range'

        attack[:attack_bonus] += 2
      end
    end

    def fighting_style_dueling(result)
      result[:attacks].each do |attack|
        next if attack[:type] != 'melee'
        next if attack[:hands] != '1'
        next if attack[:tooltips].include?('dual')

        attack[:damage_bonus] += 2
      end
    end

    def fighting_style_great_weapon_fighting(result)
      result[:class_features] << {
        title: I18n.t('dnd5.class_features.fighter.fighting_style_great_weapon_fighting.title'),
        description: I18n.t('dnd5.class_features.fighter.fighting_style_great_weapon_fighting.description')
      }
    end

    def fighting_style_protection(result)
      result[:class_features] << {
        title: I18n.t('dnd5.class_features.fighter.fighting_style_protection.title'),
        description: I18n.t('dnd5.class_features.fighter.fighting_style_protection.description')
      }
    end

    def fighting_style_two_weapon_fighting(result)
      result[:attacks].each do |attack|
        next if attack[:action_type] != 'bonus action'
        next if attack[:tooltips].exclude?('dual')

        attack[:damage_bonus] += find_key_ability_bonus(attack[:type], result, attack[:caption])
      end
    end

    def find_key_ability_bonus(type, result, captions)
      return [result.dig(:modifiers, :str), result.dig(:modifiers, :dex)].max if captions.include?('finesse')
      return result.dig(:modifiers, :str) if type == 'melee'

      result.dig(:modifiers, :dex)
    end

    # sorcerer
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
