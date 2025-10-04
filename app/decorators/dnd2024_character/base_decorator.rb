# frozen_string_literal: true

module Dnd2024Character
  class BaseDecorator < SimpleDelegator
    MELEE_ATTACK_TOOLTIPS = %w[2handed heavy].freeze
    RANGE_ATTACK_TOOLTIPS = %w[2handed heavy reload].freeze

    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :species, :legacy, :main_class, :classes, :subclasses, :level, :languages, :health, :abilities,
             :selected_features, :resistance, :immunity, :vulnerability, :energy, :coins, :darkvision,
             :weapon_core_skills, :weapon_skills, :armor_proficiency, :music, :spent_spell_slots,
             :hit_dice, :spent_hit_dice, :death_saving_throws, :selected_feats, :beastform, :background, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def proficiency_bonus
      @proficiency_bonus ||= 2 + ((level - 1) / 4)
    end

    def modifiers
      @modifiers ||= modified_abilities.transform_values { |value| calc_ability_modifier(value) }
    end

    def modified_abilities
      @modified_abilities ||=
        abilities.merge(
          *[*bonuses.pluck('abilities')].compact
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
      @speed ||= beastform.blank? ? (data.speed + sum(bonuses.pluck('speed'))) : beastform_config['speed']
    end

    def features
      []
    end

    def static_spells
      {}
    end

    def load
      @load ||= modified_abilities['str'] * 15
    end

    def spell_classes
      {}
    end

    def save_dc
      @save_dc ||= modifiers.clone
    end

    def defense_gear
      @defense_gear ||= calc_defense_gear
    end

    def armor_class
      @armor_class ||= calc_armor_class + sum(bonuses.pluck('armor_class'))
    end

    def initiative
      @initiative ||= modifiers['dex'] + sum(bonuses.pluck('initiative'))
    end

    def attacks_per_action
      @attacks_per_action ||= 1
    end

    def attacks
      @attacks ||= beastform.blank? ? ([unarmed_attack] + weapon_attacks.compact) : beastform_attacks
    end

    def conditions
      {
        resistance: resistance,
        immunity: immunity,
        vulnerability: vulnerability
      }
    end

    def selected_skills
      @selected_skills ||= data.selected_skills
    end

    def tools
      @tools ||= data.tools
    end

    private

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def skill_payload(slug, ability)
      level = selected_skills[slug].to_i
      {
        slug: slug,
        ability: ability,
        modifier: modifiers[ability] + (level * proficiency_bonus),
        level: level,
        selected: level.positive?
      }
    end

    # rubocop: disable Metrics/AbcSize
    def beastform_attacks
      beastform_config['attacks'].map do |beast_attack|
        {
          type: 'melee',
          name: beast_attack['name'][I18n.locale.to_s],
          action_type: 'action',
          hands: 2,
          melee_distance: 5,
          attack_bonus: modifiers['str'] + proficiency_bonus,
          damage: beast_attack['damage'],
          damage_bonus: modifiers['str'],
          damage_type: beast_attack['damage_type'],
          tooltips: beast_attack['tooltips'].map { |item| item[I18n.locale.to_s] }
        }
      end
    end
    # rubocop: enable Metrics/AbcSize

    def unarmed_attack
      {
        type: 'unarmed',
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        action_type: 'action', # action или bonus action
        hands: '1', # используется рук
        melee_distance: 5, # дальность
        attack_bonus: modifiers['str'] + proficiency_bonus,
        damage: '1',
        damage_bonus: modifiers['str'],
        damage_type: 'bludge',
        kind: 'unarmed',
        caption: [],
        tooltips: []
      }
    end

    def calc_armor_class
      return beastform_config['ac'] if beastform

      equiped_armor = defense_gear[:armor]
      equiped_shield = defense_gear[:shield]
      return 10 + modifiers['dex'] if equiped_armor.nil? && equiped_shield.nil?

      equiped_armor&.dig(:items_info, 'ac').to_i + equiped_shield&.dig(:items_info, 'ac').to_i
    end

    def calc_defense_gear
      armor, shield = equiped_armor_items
      {
        armor: armor.blank? ? nil : armor[0],
        shield: shield.blank? ? nil : shield[0]
      }
    end

    def weapon_attacks
      weapons.flat_map do |item|
        case item[:items_info]['type']
        when 'melee' then melee_attack(item)
        when 'range' then range_attack(item, 'range')
        when 'thrown' then [melee_attack(item), range_attack(item, 'thrown')].flatten
        end
      end
    end

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    def melee_attack(item)
      captions = item[:items_info]['caption']
      captions = {} if captions.is_a?(Array)

      key_ability_bonus = find_key_ability_bonus('melee', captions)
      # обычная атака
      response = [
        {
          type: 'melee',
          slug: item[:items_slug],
          name: item[:items_name][I18n.locale.to_s],
          action_type: 'action',
          hands: captions.key?('2handed') ? '2' : '1',
          melee_distance: captions.key?('reach') ? 10 : 5,
          attack_bonus: weapon_proficiency?(item) ? (key_ability_bonus + proficiency_bonus) : key_ability_bonus,
          damage: item[:items_info]['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:items_info]['damage_type'],
          # для будущих проверок
          kind: item[:items_kind].split[0],
          caption: captions.keys,
          tooltips: captions.slice(MELEE_ATTACK_TOOLTIPS).keys,
          notes: item[:notes]
        }
      ]

      # универсальное оружие двуручным хватом
      if captions.key?('versatile') && item[:quantity] == 1
        response << response[0].merge({
          hands: '2',
          damage: captions['versatile'],
          tooltips: ['2handed']
        })
      end

      # два лёгких оружия
      if captions.key?('light') && item[:quantity] > 1
        response[0][:tooltips] << 'dual'
        response << response[0].merge({
          action_type: 'bonus action',
          damage_bonus: 0
        })
      end

      response
    end

    def range_attack(item, type)
      captions = item[:items_info]['caption']
      captions = {} if captions.is_a?(Array)

      key_ability_bonus = find_key_ability_bonus('range', captions)
      # обычная атака
      response = [
        {
          type: type,
          slug: item[:items_slug],
          name: item[:items_name][I18n.locale.to_s],
          action_type: 'action',
          hands: captions.key?('2handed') ? '2' : '1',
          range_distance: item[:items_info]['dist'],
          attack_bonus: weapon_proficiency?(item) ? (key_ability_bonus + proficiency_bonus) : key_ability_bonus,
          damage: item[:items_info]['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:items_info]['damage_type'],
          # для будущих проверок
          kind: item[:items_kind].split[0],
          caption: captions.keys,
          tooltips: captions.slice(RANGE_ATTACK_TOOLTIPS).keys,
          notes: item[:notes]
        }
      ]

      # два лёгких оружия
      if captions.key?('light') && item[:quantity] == 2
        response << response[0].merge({
          action_type: 'bonus action',
          damage_bonus: 0
        })
      end

      response
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity

    def find_key_ability_bonus(type, captions)
      return [modifiers['str'], modifiers['dex']].max if captions.key?('finesse')
      return modifiers['str'] if type == 'melee'

      modifiers['dex']
    end

    def weapon_proficiency?(item)
      weapon_core_skills&.include?(item[:items_info]['weapon_skill']) ||
        weapon_skills&.include?(item[:items_slug])
    end

    def weapons
      __getobj__
        .items
        .joins(:item)
        .where(items: { kind: 'weapon' })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info', :quantity, :notes)
    end

    def equiped_armor_items
      @equiped_armor_items ||=
        __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .where(items: { kind: %w[shield armor] })
        .hashable_pluck('items.kind', 'items.data', 'items.info')
        .partition { |item| item[:items_kind] != 'shield' }
    end

    def beastform_config
      @beastform_config ||= beastform.blank? ? { 'abilities' => {} } : BeastformConfig.data('dnd2024')[beastform]
    end

    def bonuses
      @bonuses ||= __getobj__.bonuses.pluck(:value).compact
    end

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
