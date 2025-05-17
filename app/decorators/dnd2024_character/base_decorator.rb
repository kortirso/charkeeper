# frozen_string_literal: true

module Dnd2024Character
  class BaseDecorator
    MELEE_ATTACK_TOOLTIPS = %w[2handed heavy].freeze
    RANGE_ATTACK_TOOLTIPS = %w[2handed heavy reload].freeze

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    def decorate_fresh_character(species:, size:, main_class:, alignment:, legacy: nil)
      {
        species: species,
        legacy: legacy,
        size: size,
        main_class: main_class,
        alignment: alignment,
        classes: { main_class => 1 },
        subclasses: { main_class => nil },
        weapon_core_skills: [],
        weapon_skills: [],
        armor_proficiency: [],
        languages: [],
        selected_skills: [],
        resistance: [],
        immunity: [],
        vulnerability: [],
        tools: [],
        hit_dice: { 6 => 0, 8 => 0, 10 => 0, 12 => 0 }
      }.compact
    end

    def decorate_character_abilities(character:)
      data = character.data

      result = {
        species: data.species,
        legacy: data.legacy,
        main_class: data.main_class,
        classes: data.classes,
        subclasses: data.subclasses,
        overall_level: data.level,
        proficiency_bonus: proficiency_bonus(data),
        abilities: data.abilities,
        modifiers: modifiers(data),
        features: [], # неизменные классовые способности
        selected_features: data.selected_features, # выбранные классовые способности
        static_spells: {}, # врожденные заклинания от расы/класса
        conditions: {
          resistance: data.resistance,
          immunity: data.immunity,
          vulnerability: data.vulnerability
        },
        energy: data.energy || {}, # потраченные заряды способностей
        coins: data.coins,
        load: data.abilities['str'] * 15,
        spell_classes: {},
        weapon_core_skills: data.weapon_core_skills,
        weapon_skills: data.weapon_skills,
        armor_proficiency: data.armor_proficiency,
        languages: data.languages,
        tools: data.tools,
        music: data.music,
        spent_spell_slots: data.spent_spell_slots,
        hit_dice: data.hit_dice,
        spent_hit_dice: data.spent_hit_dice,
        death_saving_throws: data.death_saving_throws
      }.compact

      result[:save_dc] = result[:modifiers].clone
      result[:defense_gear] = defense_gear(character)
      result[:combat] = {
        armor_class: armor_class(result),
        initiative: result.dig(:modifiers, :dex) + result[:proficiency_bonus],
        speed: data.speed,
        attacks_per_action: 1
      }
      result[:health] = data.health
      result[:skills] = basis_skills(result[:modifiers])
      modify_selected_skills(result, data)
      result[:attacks] = [unarmed_attack(result)] + weapon_attacks(result, character)

      result
    end

    private

    def proficiency_bonus(data)
      2 + ((data.level - 1) / 4)
    end

    def modifiers(data)
      data.abilities.transform_values { |value| calc_ability_modifier(value) }.symbolize_keys
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def basis_skills(modifiers)
      [
        { name: 'acrobatics', ability: 'dex', modifier: modifiers[:dex], selected: false },
        { name: 'animal', ability: 'wis', modifier: modifiers[:wis], selected: false },
        { name: 'arcana', ability: 'int', modifier: modifiers[:int], selected: false },
        { name: 'athletics', ability: 'str', modifier: modifiers[:str], selected: false },
        { name: 'deception', ability: 'cha', modifier: modifiers[:cha], selected: false },
        { name: 'history', ability: 'int', modifier: modifiers[:int], selected: false },
        { name: 'insight', ability: 'wis', modifier: modifiers[:wis], selected: false },
        { name: 'intimidation', ability: 'cha', modifier: modifiers[:cha], selected: false },
        { name: 'investigation', ability: 'int', modifier: modifiers[:int], selected: false },
        { name: 'medicine', ability: 'wis', modifier: modifiers[:wis], selected: false },
        { name: 'nature', ability: 'int', modifier: modifiers[:int], selected: false },
        { name: 'perception', ability: 'wis', modifier: modifiers[:wis], selected: false },
        { name: 'performance', ability: 'cha', modifier: modifiers[:cha], selected: false },
        { name: 'persuasion', ability: 'cha', modifier: modifiers[:cha], selected: false },
        { name: 'religion', ability: 'int', modifier: modifiers[:int], selected: false },
        { name: 'sleight', ability: 'dex', modifier: modifiers[:dex], selected: false },
        { name: 'stealth', ability: 'dex', modifier: modifiers[:dex], selected: false },
        { name: 'survival', ability: 'wis', modifier: modifiers[:wis], selected: false }
      ]
    end

    def modify_selected_skills(result, data)
      return if data['selected_skills'].blank?

      result[:skills].map do |skill|
        next skill if data['selected_skills'].exclude?(skill[:name])

        skill[:modifier] += result[:proficiency_bonus]
        skill[:selected] = true
        skill
      end
    end

    def unarmed_attack(result)
      {
        type: 'unarmed',
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        action_type: 'action', # action или bonus action
        hands: '1', # используется рук
        melee_distance: 5, # дальность
        attack_bonus: result.dig(:modifiers, :str) + result[:proficiency_bonus],
        damage: 1,
        damage_bonus: result.dig(:modifiers, :str),
        damage_type: 'bludge',
        kind: 'unarmed',
        caption: [],
        tooltips: []
      }
    end

    def defense_gear(character)
      armor, shield = equiped_armor(character)
      {
        armor: armor.blank? ? nil : armor[0],
        shield: shield.blank? ? nil : shield[0]
      }
    end

    def armor_class(result)
      equiped_armor = result.dig(:defense_gear, :armor)
      equiped_shield = result.dig(:defense_gear, :shield)
      return 10 + result.dig(:modifiers, :dex) if equiped_armor.nil? && equiped_shield.nil?

      equiped_armor&.dig(:items_data, 'info', 'ac').to_i + equiped_shield&.dig(:items_data, 'info', 'ac').to_i
    end

    def weapon_attacks(result, character)
      weapons(character).flat_map do |item|
        case item[:items_data]['info']['type']
        when 'melee' then melee_attack(result, item)
        when 'range' then range_attack(result, item, 'range')
        when 'thrown' then [melee_attack(result, item), range_attack(result, item, 'thrown')].flatten
        end
      end
    end

    def melee_attack(result, item)
      captions = item[:items_data]['info']['caption']

      key_ability_bonus = find_key_ability_bonus('melee', result, captions)
      # обычная атака
      response = [
        {
          type: 'melee',
          slug: item[:items_slug],
          name: item[:items_name][I18n.locale.to_s],
          action_type: 'action',
          hands: captions.include?('2handed') ? '2' : '1',
          melee_distance: captions.include?('reach') ? 10 : 5,
          attack_bonus: weapon_proficiency(result, item) ? (key_ability_bonus + result[:proficiency_bonus]) : key_ability_bonus,
          damage: item[:items_data]['info']['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:items_data]['info']['damage_type'],
          # для будущих проверок
          kind: item[:items_kind].split[0],
          caption: captions,
          tooltips: captions.select { |item| item.in?(MELEE_ATTACK_TOOLTIPS) },
          notes: item[:notes]
        }
      ]

      # универсальное оружие двуручным хватом
      versatile = captions.find { |caption| caption.include?('versatile') }
      if versatile && item[:quantity] == 1
        response << response[0].merge({
          hands: '2',
          damage: versatile.split('-')[1],
          tooltips: ['2handed']
        })
      end

      # два лёгких оружия
      if captions.include?('light') && item[:quantity] > 1
        response[0][:tooltips] << 'dual'
        response << response[0].merge({
          action_type: 'bonus action',
          damage_bonus: 0
        })
      end

      response
    end

    def range_attack(result, item, type)
      captions = item[:items_data]['info']['caption']

      key_ability_bonus = find_key_ability_bonus('range', result, captions)
      # обычная атака
      response = [
        {
          type: type,
          slug: item[:items_slug],
          name: item[:items_name][I18n.locale.to_s],
          action_type: 'action',
          hands: captions.include?('2handed') ? '2' : '1',
          range_distance: item[:items_data]['info']['dist'],
          attack_bonus: weapon_proficiency(result, item) ? (key_ability_bonus + result[:proficiency_bonus]) : key_ability_bonus,
          damage: item[:items_data]['info']['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:items_data]['info']['damage_type'],
          # для будущих проверок
          kind: item[:items_kind].split[0],
          caption: captions,
          tooltips: captions.select { |item| item.in?(RANGE_ATTACK_TOOLTIPS) },
          notes: item[:notes]
        }
      ]

      # два лёгких оружия
      if captions.include?('light') && item[:quantity] == 2
        response << response[0].merge({
          action_type: 'bonus action',
          damage_bonus: 0
        })
      end

      response
    end

    def find_key_ability_bonus(type, result, captions)
      return [result.dig(:modifiers, :str), result.dig(:modifiers, :dex)].max if captions.include?('finesse')
      return result.dig(:modifiers, :str) if type == 'melee'

      result.dig(:modifiers, :dex)
    end

    def weapon_proficiency(result, item)
      result[:weapon_core_skills].include?(item[:items_kind]) ||
        result[:weapon_skills].include?(item[:items_slug])
    end

    def weapons(character)
      character
        .items
        .joins(:item)
        .where(items: { kind: ['light weapon', 'martial weapon'] })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', :quantity, :notes)
    end

    def equiped_armor(character)
      character
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: ['shield', 'light armor', 'medium armor', 'heavy armor'] })
        .hashable_pluck('items.kind', 'items.data')
        .partition { |item| item[:items_kind] != 'shield' }
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
  end
end
