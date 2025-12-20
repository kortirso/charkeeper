# frozen_string_literal: true

module Dnd2024Character
  class StatsDecorator < ApplicationDecorator
    SIZE_CAPACITY_MODIFIERS = {
      'tiny' => 7.5, 'small' => 15, 'medium' => 15, 'large' => 30, 'huge' => 60, 'gargantuan' => 120
    }.freeze

    def modifiers
      @modifiers ||= modified_abilities.transform_values { |value| calc_ability_modifier(value) }
    end

    def modified_abilities
      @modified_abilities ||=
        (beastform.blank? ? __getobj__.modified_abilities : with_beastform_abilities)
          .merge(
            *[
              *bonuses.pluck('abilities'),
              *static_item_bonuses.pluck('abilities'),
              *dynamic_item_bonuses.pluck('abilities')
            ].compact
          ) { |_key, oldval, newval| newval + oldval }
    end

    def skills
      @skills ||= [
        %w[acrobatics dex], %w[animal wis], %w[arcana int], %w[athletics str],
        %w[deception cha], %w[history int], %w[insight wis], %w[intimidation cha],
        %w[investigation int], %w[medicine wis], %w[nature int], %w[perception wis],
        %w[performance cha], %w[persuasion cha], %w[religion int], %w[sleight dex],
        %w[stealth dex], %w[survival wis]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def speed
      @speed ||= beastform.blank? ? speed_with_bonuses : beastform_config['speed']
    end

    def load
      @load ||= modified_abilities['str'] * SIZE_CAPACITY_MODIFIERS[size]
    end

    def save_dc
      @save_dc ||=
        if beastform.blank?
          modifiers_with_bonuses
        else
          modifiers.clone.merge(beastform_config['saves']) { |_key, oldval, newval| [newval, oldval].max }
        end
    end

    def armor_class
      @armor_class ||= beastform.blank? ? armor_class_with_bonuses : beastform_config['ac']
    end

    def initiative
      @initiative ||=
        __getobj__.initiative +
        modifiers['dex'] +
        sum(bonuses.pluck('initiative')) +
        sum(static_item_bonuses.pluck('initiative')) +
        sum(dynamic_item_bonuses.pluck('initiative'))
    end

    def attacks_per_action
      @attacks_per_action ||= 1
    end

    def attacks
      @attacks ||= beastform.blank? ? ([unarmed_attack] + weapon_attacks.compact) : beastform_attacks
    end

    def resistances
      {
        resistance: resistance,
        immunity: immunity,
        vulnerability: vulnerability
      }
    end

    private

    def modifiers_with_bonuses
      modifiers.clone.merge(
        *[
          *static_item_bonuses.pluck('saves'),
          *dynamic_item_bonuses.pluck('saves')
        ].compact
      ) { |_key, oldval, newval| newval + oldval }
    end

    def armor_class_with_bonuses
      __getobj__.armor_class +
        calc_armor_class +
        sum(bonuses.pluck('armor_class')) +
        sum(static_item_bonuses.pluck('armor_class')) +
        sum(dynamic_item_bonuses.pluck('armor_class'))
    end

    def speed_with_bonuses
      __getobj__.speed +
        sum(bonuses.pluck('speed')) +
        sum(static_item_bonuses.pluck('speed')) +
        sum(dynamic_item_bonuses.pluck('speed'))
    end

    def with_beastform_abilities
      abilities.merge(beastform_config['abilities']) { |_key, oldval, newval| [newval, oldval].max }
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def skill_payload(slug, ability)
      level = selected_skills[slug].to_i
      level = 1 if level.zero? && beastform.present? && beastform_config.dig('skills', slug)

      modifier = [modifiers[ability] + (level * proficiency_bonus), beastform_config&.dig('skills', slug)].compact.max

      {
        slug: slug,
        ability: ability,
        modifier: modifier,
        level: level,
        selected: level.positive?
      }
    end

    def beastform_attacks
      beastform_config['features']
    end

    def unarmed_attack
      {
        type: 'unarmed',
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        attack_bonus: modifiers['str'] + proficiency_bonus + attack_bonuses,
        damage: '1',
        damage_bonus: modifiers['str'],
        kind: 'unarmed',
        tags: {},
        ready_to_use: true,
        # для обратной совместимости
        action_type: 'action', # action или bonus action
        melee_distance: 5, # дальность
        hands: '1', # используется рук
        damage_type: 'bludge',
        tooltips: [],
        caption: []
      }
    end

    def calc_armor_class # rubocop: disable Metrics/AbcSize
      equiped_armor = defense_gear[:armor]
      equiped_shield = defense_gear[:shield]
      return 10 + modifiers['dex'] + equiped_shield&.dig(:items_info, 'ac').to_i if equiped_armor.nil?

      max_dex = equiped_armor.dig(:items_info, 'max_dex')
      max_dex += 1 if max_dex.to_i.positive? && __getobj__.data.selected_talents.key?('medium_armor_master')

      equiped_armor.dig(:items_info, 'ac').to_i +
        equiped_shield&.dig(:items_info, 'ac').to_i +
        [max_dex, modifiers['dex']].compact.min
    end

    def weapon_attacks
      weapons.flat_map do |item|
        case item[:items_info]['type']
        when 'melee', 'thrown' then melee_attack(item)
        when 'range' then range_attack(item, 'range')
        end
      end
    end

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    def melee_attack(item)
      captions = item[:items_info]['caption']
      captions = {} if captions.is_a?(Array)
      captions = captions.except('finesse').keys

      key_ability_bonus = find_key_ability_bonus('melee', captions)
      damage_type = item[:items_info]['damage_type']
      mastery = item[:items_info]['mastery']
      {
        type: 'melee',
        slug: item[:items_slug],
        name: item[:items_name][I18n.locale.to_s],
        attack_bonus: (weapon_proficiency?(item) ? (key_ability_bonus + proficiency_bonus) : key_ability_bonus) + attack_bonuses,
        distance: item[:items_info]['type'] == 'thrown' ? item[:items_info]['dist'] : (captions.include?('reach') ? 10 : nil), # rubocop: disable Style/NestedTernaryOperator
        damage: item[:items_info]['damage'],
        damage_bonus: key_ability_bonus,
        kind: item[:items_kind].split[0],
        notes: item[:notes],
        tags: { damage_type => I18n.t("tags.dnd.weapon.title.#{damage_type}") }.merge(
          captions.index_with { |type| I18n.t("tags.dnd.weapon.title.#{type}") }
        ).merge(
          weapon_mastery.include?(mastery) ? { mastery => I18n.t("tags.dnd.weapon.title.#{mastery}") } : {}
        ),
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true,
        # для обратной совместимости
        damage_type: damage_type,
        action_type: 'action',
        melee_distance: captions.include?('reach') ? 10 : 5,
        tooltips: [],
        hands: captions.include?('2handed') ? '2' : '1',
        caption: captions
      }.compact
    end

    def range_attack(item, type)
      captions = item[:items_info]['caption']
      captions = {} if captions.is_a?(Array)
      captions = captions.except('finesse').keys

      key_ability_bonus = find_key_ability_bonus('range', captions)
      damage_type = item[:items_info]['damage_type']
      mastery = item[:items_info]['mastery']
      base_bonus = key_ability_bonus + (selected_feats.include?('archery') ? 2 : 0)
      {
        type: type,
        slug: item[:items_slug],
        name: item[:items_name][I18n.locale.to_s],
        attack_bonus: (weapon_proficiency?(item) ? (base_bonus + proficiency_bonus) : base_bonus) + attack_bonuses,
        distance: item[:items_info]['dist'],
        damage: item[:items_info]['damage'],
        damage_bonus: key_ability_bonus,
        kind: item[:items_kind].split[0],
        notes: item[:notes],
        tags: { damage_type => I18n.t("tags.dnd.weapon.title.#{damage_type}") }.merge(
          captions.index_with { |type| I18n.t("tags.dnd.weapon.title.#{type}") }
        ).merge(
          weapon_mastery.include?(mastery) ? { mastery => I18n.t("tags.dnd.weapon.title.#{mastery}") } : {}
        ),
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true,
        # для обратной совместимости
        damage_type: damage_type,
        action_type: 'action',
        range_distance: item[:items_info]['dist'],
        tooltips: [],
        hands: captions.include?('2handed') ? '2' : '1',
        caption: captions
      }
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity

    def attack_bonuses
      @attack_bonuses ||=
        sum(static_item_bonuses.pluck('attack').compact) +
        sum(dynamic_item_bonuses.pluck('attack').compact)
    end

    def find_key_ability_bonus(type, captions)
      return [modifiers['str'], modifiers['dex']].max if captions.include?('finesse')
      return modifiers['str'] if type == 'melee'

      modifiers['dex']
    end

    def weapon_proficiency?(item)
      weapon_core_skills&.include?(item[:items_info]['weapon_skill']) ||
        weapon_skills&.include?(item[:items_slug])
    end

    def beastform_config
      @beastform_config ||= beastform.blank? ? { 'abilities' => {} } : Config.data('dnd2024', 'beastforms')[beastform]
    end

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
