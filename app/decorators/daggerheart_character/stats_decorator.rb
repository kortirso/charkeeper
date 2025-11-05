# frozen_string_literal: true

module DaggerheartCharacter
  class StatsDecorator < SimpleDelegator
    def method_missing(method, *_args)
      if instance_variable_defined?(:"@#{method}")
        instance_variable_get(:"@#{method}")
      else
        instance_variable_set(:"@#{method}", __getobj__.public_send(method))
      end
    end

    # rubocop: disable Naming/PredicateMethod
    def can_have_companion
      available_mechanics.include?('companion')
    end

    def can_have_stances
      available_mechanics.include?('stances')
    end
    # rubocop: enable Naming/PredicateMethod

    def modified_traits
      @modified_traits ||=
        __getobj__.modified_traits.merge(
          *[*equiped_traits_bonuses, *bonuses.pluck('traits'), beastform_config['traits']].compact
        ) { |_key, oldval, newval| newval + oldval }
    end

    def damage_thresholds
      @damage_thresholds ||=
        base_damage_thresholds
          .with_indifferent_access
          .merge(
            *[level_thresholds_bonuses, equiped_thresholds_bonuses, *bonuses.pluck('thresholds')].compact
          ) { |_key, oldval, newval| newval + oldval }
    end

    def evasion # rubocop: disable Metrics/AbcSize
      @evasion ||=
        __getobj__.evasion +
        leveling['evasion'].to_i +
        item_bonuses.pluck('evasion').compact.sum +
        sum(bonuses.pluck('evasion')) +
        beastform_config['evasion'] +
        stance_bonus
    end

    def armor_score
      @armor_score ||=
        base_armor_score +
        item_bonuses.pluck('armor_score').compact.sum +
        sum(bonuses.pluck('armor_score'))
    end

    def armor_slots
      @armor_slots ||= armor_score
    end

    def health_max
      @health_max ||= data.health_max + leveling['health'].to_i + sum(bonuses.pluck('health'))
    end

    def stress_max
      @stress_max ||= data.stress_max + leveling['stress'].to_i + sum(bonuses.pluck('stress'))
    end

    def hope_max
      @hope_max ||= data.hope_max + beastbound_pet_bonus
    end

    def attacks
      @attacks ||=
        beastform.blank? ? ([unarmed_attack] + weapons.flat_map { |item| calculate_attack(item) }) : [beastform_attack]
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

    def beastforms
      return [] if available_mechanics.exclude?('beastform')

      Config.data('daggerheart', 'beastforms').select { |_, values| values['tier'] <= tier }.keys
    end

    private

    def beastform_attack # rubocop: disable Metrics/AbcSize
      beast_attack = beastform_config['attack']

      {
        name: { en: 'Beast attack', ru: 'Атака' }[I18n.locale],
        range: beast_attack['range'],
        attack_bonus: (use_max_trait_for_attack ? max_trait_value : modified_traits[beast_attack['trait']]) + attack_bonuses,
        damage: "#{(proficiency / 2.0).round}#{beast_attack['damage']}",
        damage_bonus: beast_attack['damage_bonus'],
        damage_type: beast_attack['damage_type'],
        kind: 'primary weapon',
        features: [],
        notes: [],
        ready_to_use: true,
        tags: { beast_attack['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{beast_attack['damage_type']}") }
      }
    end

    def unarmed_attack
      {
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        range: 'melee',
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

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    def calculate_attack(item)
      response = [{
        name: item[:items_name][I18n.locale.to_s],
        range: item[:items_info]['range'],
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
        }
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
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

    def trait_bonus(item)
      trait = item[:items_info]['trait']
      trait ? modified_traits[trait] : max_trait_value
    end

    def max_trait_value
      modified_traits.values.max
    end

    def attack_bonuses
      @attack_bonuses ||= sum(bonuses.pluck('attack').compact)
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
      @beastform_config ||=
        beastform.blank? ? { 'traits' => {}, 'evasion' => 0 } : Config.data('daggerheart', 'beastforms')[beastform]
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
