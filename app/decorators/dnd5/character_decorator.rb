# frozen_string_literal: true

# rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
module Dnd5
  class CharacterDecorator
    extend Dry::Initializer

    option :data

    def decorate
      result = {
        race: data.race,
        classes: data.classes,
        overall_level: data.level,
        proficiency_bonus: proficiency_bonus,
        abilities: data.abilities,
        modifiers: modifiers,
        class_features: [],
        resistances: [],
        immunities: [],
        energy: data.energy,
        coins: data.coins,
        load: data.abilities['str'] * 15,
        spell_classes: {},
        weapon_core_skills: data.weapon_core_skills,
        weapon_skills: data.weapon_skills
      }.compact

      result[:save_dc] = result[:modifiers].clone
      result[:defense_gear] = defense_gear
      result[:combat] = {
        armor_class: armor_class(result),
        initiative: result.dig(:modifiers, :dex) + result[:proficiency_bonus],
        speed: data['speed'],
        attacks_per_action: 1,
        health: data['health']
      }
      result[:skills] = basis_skills(result[:modifiers])
      modify_selected_skills(result)
      result[:attacks] = [unarmed_attack(result)] + weapon_attacks(result)

      result
    end

    private

    def proficiency_bonus
      2 + ((data.level - 1) / 4)
    end

    def modifiers
      data.abilities.transform_values { |value| calc_ability_modifier(value) }.symbolize_keys
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def basis_skills(modifiers)
      [
        { name: 'acrobatics', ability: 'dex', modifier: modifiers[:dex] },
        { name: 'animal', ability: 'wis', modifier: modifiers[:wis] },
        { name: 'arcana', ability: 'int', modifier: modifiers[:int] },
        { name: 'athletics', ability: 'str', modifier: modifiers[:str] },
        { name: 'deception', ability: 'cha', modifier: modifiers[:cha] },
        { name: 'history', ability: 'int', modifier: modifiers[:int] },
        { name: 'insight', ability: 'wis', modifier: modifiers[:wis] },
        { name: 'intimidation', ability: 'cha', modifier: modifiers[:cha] },
        { name: 'investigation', ability: 'int', modifier: modifiers[:int] },
        { name: 'medicine', ability: 'wis', modifier: modifiers[:wis] },
        { name: 'nature', ability: 'int', modifier: modifiers[:int] },
        { name: 'perception', ability: 'wis', modifier: modifiers[:wis] },
        { name: 'performance', ability: 'cha', modifier: modifiers[:cha] },
        { name: 'persuasion', ability: 'cha', modifier: modifiers[:cha] },
        { name: 'religion', ability: 'int', modifier: modifiers[:int] },
        { name: 'sleight', ability: 'dex', modifier: modifiers[:dex] },
        { name: 'stealth', ability: 'dex', modifier: modifiers[:dex] },
        { name: 'survival', ability: 'wis', modifier: modifiers[:wis] }
      ]
    end

    def modify_selected_skills(result)
      return if data['selected_skills'].blank?

      result[:skills].map do |skill|
        next skill if data['selected_skills'].exclude?(skill[:name])

        skill[:modifier] += result[:proficiency_bonus]
        skill
      end
    end

    def unarmed_attack(result)
      {
        name: { en: 'Unarmed', ru: 'Безоружная' },
        action_type: 'action', # action или bonus action
        hands: '1', # используется рук
        melee_distance: 5, # дальность
        attack_bonus: result.dig(:modifiers, :str) + result[:proficiency_bonus],
        damage: 1,
        damage_bonus: result.dig(:modifiers, :str),
        damage_type: 'bludge',
        kind: 'unarmed',
        caption: []
      }
    end

    def defense_gear
      armor, shield = find_equiped_armor
      {
        armor: armor.blank? ? nil : armor[0],
        shield: shield.blank? ? nil : shield[0]
      }
    end

    def armor_class(result)
      equiped_armor = result.dig(:defense_gear, :armor)
      equiped_shield = result.dig(:defense_gear, :shield)
      return 10 + result.dig(:modifiers, :dex) if equiped_armor.nil? && equiped_shield.nil?

      equiped_armor.dig(:dnd5_items_data, 'ac').to_i + equiped_shield.dig(:dnd5_items_data, 'ac').to_i
    end

    def weapon_attacks(result)
      equiped_weapons.flat_map do |item|
        case item[:dnd5_items_data]['type']
        when 'melee' then melee_attack(result, item)
        when 'range' then range_attack(result, item)
        when 'thrown' then [melee_attack(result, item), range_attack(result, item)].flatten
        end
      end
    end

    def melee_attack(result, item)
      captions = item[:dnd5_items_data]['caption']

      key_ability_bonus = find_key_ability_bonus('melee', result, captions)
      # обычная атака
      response = [
        {
          name: item[:dnd5_items_name],
          action_type: 'action',
          hands: captions.include?('2handed') ? '2' : '1',
          melee_distance: captions.include?('reach') ? 10 : 5,
          attack_bonus: weapon_proficiency(result, item) ? (key_ability_bonus + result[:proficiency_bonus]) : key_ability_bonus,
          damage: item[:dnd5_items_data]['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:dnd5_items_data]['damage_type'],
          # для будущих проверок
          kind: item[:dnd5_items_kind].split[0],
          caption: captions
        }
      ]

      # универсальное оружие двуручным хватом
      versatile = captions.find { |caption| caption.include?('versatile') }
      if versatile && item[:quantity] == 1
        response << response[0].merge({
          hands: '2',
          damage: versatile.split('-')[1]
        })
      end

      # два лёгких оружия
      if captions.include?('light') && item[:quantity] == 2
        response[0][:hands] << 'dual'
        response << response[0].merge({
          action_type: 'bonus action',
          damage_bonus: 0
        })
      end

      response
    end

    def range_attack(result, item)
      captions = item[:dnd5_items_data]['caption']

      key_ability_bonus = find_key_ability_bonus('range', result, captions)
      # обычная атака
      response = [
        {
          name: item[:dnd5_items_name],
          action_type: 'action',
          hands: captions.include?('2handed') ? '2' : '1',
          range_distance: item[:dnd5_items_data]['dist'],
          attack_bonus: weapon_proficiency(result, item) ? (key_ability_bonus + result[:proficiency_bonus]) : key_ability_bonus,
          damage: item[:dnd5_items_data]['damage'],
          damage_bonus: key_ability_bonus,
          damage_type: item[:dnd5_items_data]['damage_type'],
          # для будущих проверок
          kind: item[:dnd5_items_kind].split[0],
          caption: captions
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
      result[:weapon_core_skills].include?(item[:dnd5_items_kind]) ||
        result[:weapon_skills].include?(item[:dnd5_items_name]['en'])
    end

    def equiped_weapons
      data
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(dnd5_items: { kind: ['light weapon', 'martial weapon'] })
        .hashable_pluck('dnd5_items.name', 'dnd5_items.kind', 'dnd5_items.data', :quantity)
    end

    def find_equiped_armor
      data
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(dnd5_items: { kind: ['shield', 'light armor', 'medium armor', 'heavy armor'] })
        .hashable_pluck('dnd5_items.kind', 'dnd5_items.data')
        .partition { |item| item[:dnd5_items_kind] != 'shield' }
    end

    # def prepared_spells
    #   data
    #     .spells
    #     .where(ready_to_use: true)
    #     .joins(:spell)
    #     .order('dnd5_spells.level ASC')
    #     .hashable_pluck('dnd5_spells.name', 'dnd5_spells.comment', :prepared_by)
    # end
  end
end
# rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
