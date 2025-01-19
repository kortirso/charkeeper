# frozen_string_literal: true

# rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/BlockLength
module Dnd5
  class CharacterDecorator
    extend Dry::Initializer

    option :character

    def decorate
      data = character.data

      result = {
        race: data['race'],
        classes: data['classes'],
        overall_level: data['classes'].values.sum,
        abilities: data['abilities'],
        modifiers: modifiers,
        class_features: [],
        resistances: [],
        immunities: [],
        energy: data['energy'],
        coins: data['coins'],
        load: data.dig('abilities', 'str') * 15,
        spell_classes: []
      }.compact

      result[:proficiency_bonus] = proficiency_bonus(result[:overall_level])
      result[:saving_throws] = result[:modifiers].clone
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

    def proficiency_bonus(overall_level)
      2 + ((overall_level - 1) / 4)
    end

    def modifiers
      character.data['abilities'].transform_values { |value| calc_ability_modifier(value) }.symbolize_keys
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
      return if character.data['skills'].blank?

      result[:skills].map do |skill|
        next skill if character.data['skills'].exclude?(skill[:name])

        skill[:modifier] += result[:proficiency_bonus]
        skill
      end
    end

    def unarmed_attack(result)
      {
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        action_type: 'action', # action или bonus action
        hands: 1, # используется рук
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

      equiped_armor.dig(:items_data, 'ac').to_i + equiped_shield.dig(:items_data, 'ac').to_i
    end

    def weapon_attacks(result)
      equiped_weapons.flat_map do |item|
        key_ability_bonus =
          if item[:items_data]['caption'].include?('finesse')
            [result.dig(:modifiers, :str), result.dig(:modifiers, :dex)].max
          elsif item[:items_kind].include?('melee')
            result.dig(:modifiers, :str)
          else
            result.dig(:modifiers, :dex)
          end

        # обычная атака
        response = [
          {
            name: item[:items_name][I18n.locale.to_s],
            action_type: 'action',
            hands: item[:items_data]['caption'].include?('2handed') ? 2 : 1,
            # rubocop: disable Style/NestedTernaryOperator
            melee_distance: item[:items_kind].include?('melee') ? (item[:items_data]['caption'].include?('reach') ? 10 : 5) : nil,
            # rubocop: enable Style/NestedTernaryOperator
            range_distance: item[:items_data]['dist'],
            attack_bonus: key_ability_bonus + result[:proficiency_bonus],
            damage: item[:items_data]['damage'],
            damage_bonus: key_ability_bonus,
            damage_type: item[:items_data]['type'],
            kind: item[:items_kind], # для будущих проверок
            caption: item[:items_data]['caption'] # для будущих проверок
          }.compact
        ]

        # универсальное оружие двуручным хватом
        versatile = item[:items_data]['caption'].find { |caption| caption.include?('versatile') }
        if versatile
          response << response[0].merge({
            hands: 2,
            damage: versatile.split('-')[1]
          })
        end

        # два лёгких оружия
        if item[:items_data]['caption'].include?('light') && item[:quantity] == 2
          response << response[0].merge({
            action_type: 'bonus action',
            damage_bonus: 0
          })
        end

        response
      end
    end

    def equiped_weapons
      character
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: ['light melee weapon', 'light range weapon'] })
        .hashable_pluck('items.name', 'items.kind', 'items.data', :quantity)
    end

    def find_equiped_armor
      character
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: ['shield', 'light armor', 'medium armor', 'heavy armor'] })
        .hashable_pluck('items.kind', 'items.data')
        .partition { |item| item[:items_kind] != 'shield' }
    end
  end
end
# rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/BlockLength
