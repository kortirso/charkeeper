# frozen_string_literal: true

module CharactersContext
  class Dnd5RulePresenter
    extend Dry::Initializer

    option :character

    CLASS_SAVING_THROWS = {
      'barbarian' => %i[str con],
      'bard' => %i[dex cha],
      'cleric' => %i[wis cha],
      'druid' => %i[int wis],
      'fighter' => %i[str con],
      'monk' => %i[str dex],
      'paladin' => %i[wis cha],
      'ranger' => %i[str dex],
      'rogue' => %i[dex int],
      'sorcerer' => %i[con cha],
      'wizard' => %i[int wis],
      'warlock' => %i[wis cha],
      'artificer' => %i[con int]
    }.freeze

    RACES_WITH_LOW_SPEED = %w[dwarf halfling gnome].freeze

    def represent_data
      {
        overall_level: overall_level,
        proficiency_bonus: proficiency_bonus,
        modifiers: modifiers,
        saving_throws: saving_throws,
        class_saving_throws: class_saving_throws,
        skills: skills,
        combat: combat,
        attacks: attacks.push(arms_attack)
      }
    end

    def overall_level
      @overall_level ||= character.data['classes'].values.sum
    end

    private

    def proficiency_bonus
      @proficiency_bonus ||= 2 + ((overall_level - 1) / 4)
    end

    # rubocop: disable Metrics/AbcSize
    def modifiers
      @modifiers ||=
        character.data['abilities'].transform_values { |value| calc_ability_modifier(value) }.symbolize_keys
    end

    def saving_throws
      {
        str: modifiers[:str] + (class_saving_throws.include?(:str) ? proficiency_bonus : 0),
        dex: modifiers[:dex] + (class_saving_throws.include?(:dex) ? proficiency_bonus : 0),
        con: modifiers[:con] + (class_saving_throws.include?(:con) ? proficiency_bonus : 0),
        int: modifiers[:int] + (class_saving_throws.include?(:int) ? proficiency_bonus : 0),
        wis: modifiers[:wis] + (class_saving_throws.include?(:wis) ? proficiency_bonus : 0),
        cha: modifiers[:cha] + (class_saving_throws.include?(:cha) ? proficiency_bonus : 0)
      }
    end

    def class_saving_throws
      @class_saving_throws ||= CLASS_SAVING_THROWS[first_class]
    end

    # rubocop: disable Metrics/MethodLength
    def skills
      @skills ||=
        {
          acrobatics: { ability: 'dex', modifier: modifiers[:dex] },
          animal: { ability: 'wis', modifier: modifiers[:wis] },
          arcana: { ability: 'int', modifier: modifiers[:int] },
          athletics: { ability: 'str', modifier: modifiers[:str] },
          deception: { ability: 'cha', modifier: modifiers[:cha] },
          history: { ability: 'int', modifier: modifiers[:int] },
          insight: { ability: 'wis', modifier: modifiers[:wis] },
          intimidation: { ability: 'cha', modifier: modifiers[:cha] },
          investigation: { ability: 'int', modifier: modifiers[:int] },
          medicine: { ability: 'wis', modifier: modifiers[:wis] },
          nature: { ability: 'int', modifier: modifiers[:int] },
          perception: { ability: 'wis', modifier: modifiers[:wis] },
          performance: { ability: 'cha', modifier: modifiers[:cha] },
          persuasion: { ability: 'cha', modifier: modifiers[:cha] },
          religion: { ability: 'int', modifier: modifiers[:int] },
          sleight: { ability: 'dex', modifier: modifiers[:dex] },
          stealth: { ability: 'dex', modifier: modifiers[:dex] },
          survival: { ability: 'wis', modifier: modifiers[:wis] }
        }
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

    def combat
      {
        armor_class: armor_class,
        initiative: modifiers[:dex] + proficiency_bonus,
        speed: speed
      }
    end

    def attacks
      equiped_weapons.flat_map do |item|
        key_ability_bonus =
          if item[:items_data]['caption'].include?('finesse')
            [modifiers[:str], modifiers[:dex]].max
          elsif item[:items_kind].include?('melee')
            modifiers[:str]
          else
            modifiers[:dex]
          end

        # обычная атака
        result = [
          {
            name: item[:items_name]['en'],
            hands: item[:items_data]['caption'].include?('2handed') ? 2 : 1,
            damage: item[:items_data]['damage'],
            damage_bonus: key_ability_bonus,
            damage_type: item[:items_data]['type'],
            attack_bonus: key_ability_bonus + proficiency_bonus,
            melee_distance: item[:items_kind].include?('melee') ? (item[:items_data]['caption'].include?('reach') ? 10 : 5) : nil,
            range_distance: item[:items_data]['dist']
          }.compact
        ]

        # универсальное оружие двуручным хватом
        versatile = item[:items_data]['caption'].find { |dam| dam.include?('versatile') }
        if versatile
          result << result[0].merge({
            hands: 2,
            damage: versatile.split('-')[1]
          })
        end

        result
      end
    end

    def armor_class
      if equiped_armor.blank?
        result = 10 + modifiers[:dex]
        result += modifiers[:wis] if character.data['classes']['monk']
        result += modifiers[:con] if character.data['classes']['barbarian']
        result
      elsif character.data['classes']['barbarian'] && equiped_armor.size == 1 && equiped_armor[1, 0] == 'shield'
        10 + modifiers[:dex] + modifiers[:con]
      else
        equiped_armor.sum { |item| item[1]['ac'] }
      end
    end

    def speed
      result = RACES_WITH_LOW_SPEED.include?(character.data['race']) ? 25 : 30

      if character.data['classes']['barbarian'].to_i >= 5
        result += 10
      end
      if character.data['classes']['monk'].to_i >= 2
        result += (((character.data['classes']['monk'] + 2) / 4) + 1) * 5
      end

      result
    end

    def first_class
      character.data['classes'].keys.first
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def arms_attack
      {
        name: 'Arms',
        hands: 1,
        damage: 1 + modifiers[:str],
        damage_type: 'bludge',
        attack_bonus: modifiers[:str] + proficiency_bonus,
        melee_distance: 5
      }
    end

    def equiped_weapons
      @equiped_weapons ||=
        character
          .items
          .where(ready_to_use: true)
          .joins(:item)
          .where(items: { kind: ['light melee weapon', 'light range weapon'] })
          .hashable_pluck('items.name', 'items.kind', 'items.data', :quantity)
    end

    def equiped_armor
      @equiped_armor ||=
        character
          .items
          .where(ready_to_use: true)
          .joins(:item)
          .where(items: { kind: ['shield', 'light armor', 'medium armor', 'heavy armor'] })
          .pluck('items.kind', 'items.data')
    end
  end
end
