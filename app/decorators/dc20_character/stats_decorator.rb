# frozen_string_literal: true

module Dc20Character
  class StatsDecorator < SimpleDelegator
    def method_missing(method, *_args)
      if instance_variable_defined?(:"@#{method}")
        instance_variable_get(:"@#{method}")
      else
        instance_variable_set(:"@#{method}", __getobj__.public_send(method))
      end
    end

    def attacks
      @attacks ||= [unarmed_attack] + character_weapons.map { |item| calculate_attack(item) }
    end

    def precision_defense
      @precision_defense ||= __getobj__.precision_defense.transform_values { |value| value + guard_bonuses }
    end

    private

    def guard_bonuses
      attacks.count { |attack| attack[:ready_to_use] && attack[:features].include?('Guard') }
    end

    def unarmed_attack
      {
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        attack_bonus: modified_abilities['prime'] + combat_mastery,
        damage: 0,
        damage_types: ['b'],
        features: [],
        features_text: [],
        notes: [],
        ready_to_use: true
      }
    end

    # rubocop: disable Metrics/AbcSize
    def calculate_attack(item)
      result = {
        name: item.dig(:items_name, I18n.locale.to_s),
        attack_bonus: modified_abilities['prime'] + combat_mastery,
        distance: item.dig(:items_info, 'distance'),
        damage: item.dig(:items_info, 'damage'),
        damage_types: item.dig(:items_info, 'damage_types'),
        features: item.dig(:items_info, 'features'),
        notes: item[:notes] || [],
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true
      }

      result[:features] += item.dig(:items_info, 'styles') if combat_expertise.include?('weapon')
      result[:features_text] = result[:features].map { |feature| I18n.t("decorators.dc20.weapon_features.#{feature}") }
      result
    end
    # rubocop: enable Metrics/AbcSize

    def character_weapons
      parent
        .items
        .joins(:item)
        .where(items: { kind: 'weapon' })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.info', :notes, :state)
    end
  end
end
