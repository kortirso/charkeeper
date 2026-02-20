# frozen_string_literal: true

module DaggerheartCharacter
  class StatsDecorator < ApplicationDecorator
    # rubocop: disable Naming/PredicateMethod
    def can_have_companion
      available_mechanics.include?('companion')
    end

    def can_have_stances
      available_mechanics.include?('stances')
    end

    def can_have_beastform
      available_mechanics.include?('beastform')
    end
    # rubocop: enable Naming/PredicateMethod

    def modified_traits # rubocop: disable Metrics/AbcSize
      @modified_traits ||=
        __getobj__.modified_traits.merge(
          *[
            *equiped_traits_bonuses,
            *bonuses.pluck('traits'),
            *dynamic_bonuses.pluck('traits'),
            *static_feat_bonuses.pluck('traits'),
            *dynamic_feat_bonuses.pluck('traits'),
            *static_item_bonuses.pluck('traits'),
            *dynamic_item_bonuses.pluck('traits'),
            beastform_config['traits'],
            leveling_traits
          ].compact
        ) { |_key, oldval, newval| newval + oldval }
    end

    def damage_thresholds
      @damage_thresholds ||=
        base_damage_thresholds
          .with_indifferent_access
          .merge(
            *[
              level_thresholds_bonuses,
              equiped_thresholds_bonuses,
              *bonuses.pluck('thresholds'),
              *dynamic_bonuses.pluck('thresholds'),
              *static_feat_bonuses.pluck('thresholds'),
              *dynamic_feat_bonuses.pluck('thresholds'),
              *static_item_bonuses.pluck('thresholds'),
              *dynamic_item_bonuses.pluck('thresholds')
            ].compact
          ) { |_key, oldval, newval| newval + oldval }
    end

    def evasion # rubocop: disable Metrics/AbcSize
      @evasion ||=
        __getobj__.evasion +
        leveling['evasion'].to_i +
        item_bonuses.pluck('evasion').compact.sum +
        sum(bonuses.pluck('evasion')) +
        sum(dynamic_bonuses.pluck('evasion')) +
        sum(static_feat_bonuses.pluck('evasion')) +
        sum(dynamic_feat_bonuses.pluck('evasion')) +
        sum(static_item_bonuses.pluck('evasion')) +
        sum(dynamic_item_bonuses.pluck('evasion')) +
        beastform_config['evasion'] +
        stance_bonus
    end

    def health_max # rubocop: disable Metrics/AbcSize
      @health_max ||=
        data.health_max +
        leveling['health'].to_i +
        sum(bonuses.pluck('health')) +
        sum(dynamic_bonuses.pluck('health')) +
        sum(static_feat_bonuses.pluck('health')) +
        sum(dynamic_feat_bonuses.pluck('health')) +
        sum(static_item_bonuses.pluck('health')) +
        sum(dynamic_item_bonuses.pluck('health'))
    end

    def stress_max # rubocop: disable Metrics/AbcSize
      @stress_max ||=
        data.stress_max +
        leveling['stress'].to_i +
        sum(bonuses.pluck('stress')) +
        sum(dynamic_bonuses.pluck('stress')) +
        sum(static_feat_bonuses.pluck('stress')) +
        sum(dynamic_feat_bonuses.pluck('stress')) +
        sum(static_item_bonuses.pluck('stress')) +
        sum(dynamic_item_bonuses.pluck('stress'))
    end

    def hope_max # rubocop: disable Metrics/AbcSize
      @hope_max ||=
        data.hope_max +
        beastbound_pet_bonus +
        sum(bonuses.pluck('hope')) +
        sum(dynamic_bonuses.pluck('hope')) +
        sum(static_feat_bonuses.pluck('hope')) +
        sum(dynamic_feat_bonuses.pluck('hope')) +
        sum(static_item_bonuses.pluck('hope')) +
        sum(dynamic_item_bonuses.pluck('hope')) -
        scars.size
    end

    def scarred_hope
      scars.size
    end

    def attacks
      @attacks ||=
        beastform.blank? ? ([unarmed_attack] + weapons.flat_map { |item| calculate_attack(item) }) : beastform_attack
    end

    def domain_cards_max
      @domain_cards_max ||= 1 + level + leveling['domain_cards'].to_i + subclasses_mastery['school_of_knowledge'].to_i
    end

    def spellcast_traits
      @spellcast_traits ||=
        subclasses.filter_map do |key, value|
          default = Daggerheart::Character.subclass_info(key, value)
          default ? default['spellcast'] : spellcast_for_homebrew_subclass(value)
        end.uniq # rubocop: disable Style/MethodCalledOnDoEndBlock
    end

    def available_mechanics
      @available_mechanics ||=
        subclasses.filter_map do |key, value|
          default = Daggerheart::Character.subclass_info(key, value)
          default ? default['mechanics'] : mechanics_for_homebrew_subclass(value)
        end.flatten.uniq # rubocop: disable Style/MethodCalledOnDoEndBlock
    end

    # TODO: DEPRECATED
    def beastforms
      return [] if available_mechanics.exclude?('beastform')

      Config.data('daggerheart', 'beastforms').select { |_, values| values['tier'] <= tier }.keys
    end

    private

    def leveling_traits
      leveling['selected_traits'].values.flatten.tally
    end

    def beastform_attack # rubocop: disable Metrics/AbcSize
      return [] unless beastform_config

      beast_attack = beastform_config['attack']
      [
        {
          name: translate({ en: 'Beast attack', ru: 'Атака' }),
          range: beast_attack['range'],
          trait: use_max_trait_for_attack ? max_trait : beast_attack['trait'],
          attack_bonus: (use_max_trait_for_attack ? max_trait_value : modified_traits[beast_attack['trait']]) + attack_bonuses,
          damage: "#{proficiency}#{beast_attack['damage']}",
          damage_bonus: beast_attack['damage_bonus'],
          damage_type: beast_attack['damage_type'],
          kind: 'primary weapon',
          features: [],
          notes: [],
          ready_to_use: true,
          tags: { beast_attack['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{beast_attack['damage_type']}") }
        }
      ]
    end

    def unarmed_attack
      {
        name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
        range: 'melee',
        trait: use_max_trait_for_attack ? max_trait : max_unarmed_trait,
        attack_bonus: (use_max_trait_for_attack ? max_trait_value : [modified_traits['str'], modified_traits['fin']].max) + attack_bonuses + stance_attack_bonus, # rubocop: disable Layout/LineLength
        damage: "#{proficiency}d4",
        damage_bonus: 0,
        damage_type: 'physical',
        kind: 'primary weapon',
        features: [],
        notes: [],
        ready_to_use: true,
        tags: { 'physical' => I18n.t('tags.daggerheart.weapon.title.physical') }
      }
    end

    def calculate_attack(item) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
      response = [{
        name: translate(item[:items_name]),
        range: item[:items_info]['range'],
        trait: use_max_trait_for_attack ? max_trait : item[:items_info]['trait'],
        attack_bonus: (use_max_trait_for_attack ? max_trait_value : trait_bonus(item)) + attack_bonuses + stance_attack_bonus +
                      item.dig(:items_info, 'bonuses', 'attack').to_i,
        damage: item[:items_info]['damage']&.gsub('d', "#{proficiency}d"),
        damage_bonus: item[:items_info]['damage_bonus'],
        damage_type: item[:items_info]['damage_type'],
        kind: item[:items_kind],
        features: item[:items_info]['features'] || [],
        notes: item[:notes] || [],
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::ACTIVE_STATES) : true,
        tags: {
          item[:items_kind].tr(' ', '_') => I18n.t("tags.daggerheart.weapon.title.#{item[:items_kind].tr(' ', '_')}"),
          item[:items_info]['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{item[:items_info]['damage_type']}")
        },
        burden: item[:items_info]['burden']
      }]

      if item[:items_info]['burden'] == 2
        response[0][:tags] = response[0][:tags].merge({ 'Two-Handed' => I18n.t('tags.daggerheart.weapon.title.Two-Handed') })
      end

      versatile = item[:items_info]['versatile']
      if versatile
        response << response[0].merge({
          range: versatile['range'],
          attack_bonus: modified_traits[versatile['trait']],
          damage: "#{proficiency}#{versatile['damage']}",
          damage_bonus: versatile['damage_bonus']
        })
      end

      response
    end

    def trait_bonus(item)
      trait = item[:items_info]['trait']
      trait ? modified_traits[trait] : max_trait_value
    end

    def max_trait
      modified_traits.max_by { |_k, v| v }[0]
    end

    def max_unarmed_trait
      modified_traits.slice('str', 'fin').max_by { |_k, v| v }[0]
    end

    def max_trait_value
      modified_traits.values.max
    end

    def attack_bonuses # rubocop: disable Metrics/AbcSize
      @attack_bonuses ||=
        sum(bonuses.pluck('attack').compact) +
        sum(dynamic_bonuses.pluck('attack').compact) +
        sum(static_feat_bonuses.pluck('attack').compact) +
        sum(dynamic_feat_bonuses.pluck('attack').compact) +
        sum(static_item_bonuses.pluck('attack').compact) +
        sum(dynamic_item_bonuses.pluck('attack').compact) +
        attack
    end

    def equiped_traits_bonuses
      item_bonuses.pluck('traits').compact
    end

    def weapons
      character_weapons + feat_weapons
    end

    def character_weapons
      __getobj__
        .items
        .joins(:item)
        .where(items: { kind: ['primary weapon', 'secondary weapon'] })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info', :notes, :state)
    end

    def feat_weapons
      Item
        .where(itemable_type: 'Feat', itemable_id: features)
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info')
    end

    def features
      feats.joins(:feat).pluck('feats.id')
    end

    def sum(values)
      values.sum(&:to_i)
    end

    def beastbound_pet_bonus
      return 0 unless subclasses.value?('beastbound')
      return 0 unless __getobj__.companion

      __getobj__.companion.data.leveling['light'].to_i
    end

    def stance_bonus
      return 0 if stance.nil?

      values = Daggerheart::Character.stances[stance]
      return 0 unless values

      values['evasion'].to_i
    end

    def stance_attack_bonus
      return 0 if stance.nil?

      values = Daggerheart::Character.stances[stance]
      return 0 unless values

      values['attack_bonus'].to_i
    end

    def beastform_config
      @beastform_config ||= find_beastform_config
    end

    def find_beastform_config
      return { 'traits' => {}, 'evasion' => 0 } if beastform.blank?

      base_beastform = Config.data('daggerheart', 'beastforms')[beastform]
      return base_beastform if base_beastform
      return { 'traits' => {}, 'evasion' => 0 } if beast.blank?
      return legendary_beast_stats(Config.data('daggerheart', 'beastforms')[beast]) if beastform == 'legendary_beast'
      return mythic_beast_stats(Config.data('daggerheart', 'beastforms')[beast]) if beastform == 'mythic_beast'

      { 'traits' => {}, 'evasion' => 0 }
    end

    def legendary_beast_stats(base_beastform)
      base_beastform['traits'].transform_values! { |value| value + 1 }
      base_beastform['evasion'] += 2
      base_beastform['attack']['damage_bonus'] += 6
      base_beastform
    end

    def mythic_beast_stats(base_beastform)
      base_beastform['traits'].transform_values! { |value| value + 2 }
      base_beastform['evasion'] += 3
      base_beastform['attack']['damage_bonus'] += 9
      base_beastform
    end

    def spellcast_for_homebrew_subclass(subclass)
      homebrew_subclass(subclass).data.spellcast
    end

    def mechanics_for_homebrew_subclass(subclass)
      homebrew_subclass(subclass).data.mechanics
    end

    def level_thresholds_bonuses
      { 'major' => level, 'severe' => level }
    end

    def equiped_thresholds_bonuses
      equiped_armor_info&.dig('bonuses', 'thresholds') || {}
    end

    def item_bonuses
      @item_bonuses ||= [equiped_armor_info&.dig('bonuses')].compact + equiped_weapon_info.pluck('bonuses').compact
    end

    def homebrew_subclass(subclass)
      @homebrew_subclass ||= Daggerheart::Homebrew::Subclass.find(subclass)
    end
  end
end
