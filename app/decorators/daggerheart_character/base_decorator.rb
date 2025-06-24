# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :heritage, :main_class, :classes, :subclasses, :level, :gold, :spent_armor_slots, :health_marked, :stress_marked,
             :hope_marked, :traits, :total_gold, :subclasses_mastery, :experiences, :energy, :community, :selected_features,
             :leveling, :experience, :heritage_name, :heritage_features, to: :data

    def method_missing(_method, *args); end

    def modified_traits
      @modified_traits ||=
        traits.merge(*[equiped_traits_bonuses, *bonuses.pluck('traits')].compact) { |_key, oldval, newval| newval + oldval }
    end

    def damage_thresholds
      @damage_thresholds ||=
        { 'minor' => level, 'major' => level, 'severe' => equiped_thresholds_bonuses.any? ? level : (2 * level) }
          .merge(*[equiped_thresholds_bonuses, *bonuses.pluck('thresholds')].compact) { |_key, oldval, newval| newval + oldval }
    end

    def evasion
      @evasion ||=
        data.evasion +
        leveling['evasion'].to_i +
        item_bonuses.pluck('evasion').compact.sum +
        sum(bonuses.pluck('evasion'))
    end

    def armor_score
      @armor_score ||=
        equiped_items_info.pluck('base_score').compact.sum +
        item_bonuses.pluck('armor_score').compact.sum +
        sum(bonuses.pluck('armor_score'))
    end

    def armor_slots
      @armor_slots ||=
        equiped_items_info.pluck('base_score').compact.sum +
        item_bonuses.pluck('armor_score').compact.sum +
        sum(bonuses.pluck('armor_score'))
    end

    def health_max
      @health_max ||= data.health_max + leveling['health'].to_i + sum(bonuses.pluck('health'))
    end

    def stress_max
      @stress_max ||= data.stress_max + leveling['stress'].to_i + sum(bonuses.pluck('stress'))
    end

    def hope_max
      @hope_max ||= data.hope_max
    end

    def proficiency
      @proficiency ||= 1 + leveling['proficiency'].to_i + proficiency_by_level + sum(bonuses.pluck('proficiency'))
    end

    def attacks
      @attacks ||= [unarmed_attack] + weapons.flat_map { |item| calculate_attack(item) }
    end

    private

    def proficiency_by_level
      return 3 if level >= 8
      return 2 if level >= 5
      return 1 if level >= 2

      0
    end

    def unarmed_attack
      {
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        burden: 2,
        range: 'melee',
        attack_bonus: [modified_traits['str'], modified_traits['fin']].max + attack_bonuses,
        damage: "#{(proficiency / 2.0).round}d4",
        damage_bonus: 0,
        damage_type: 'physical',
        kind: 'primary weapon',
        features: [],
        notes: [],
        ready_to_use: false
      }
    end

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    def calculate_attack(item)
      response = [{
        name: item[:items_name][I18n.locale.to_s],
        burden: item[:items_info]['burden'],
        range: item[:items_info]['range'],
        attack_bonus: modified_traits[item[:items_info]['trait']] + attack_bonuses,
        damage: "#{proficiency}#{item[:items_info]['damage']}",
        damage_bonus: item[:items_info]['damage_bonus'],
        damage_type: item[:items_info]['damage_type'],
        kind: item[:items_kind],
        features: item[:items_info]['features'],
        notes: item[:notes],
        ready_to_use: item[:ready_to_use]
      }]

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

    def attack_bonuses
      @attack_bonuses ||= sum(bonuses.pluck('attack'))
    end

    def item_bonuses
      @item_bonuses ||= equiped_items_info.pluck('bonuses')
    end

    def equiped_thresholds_bonuses
      @equiped_thresholds_bonuses ||= item_bonuses.pluck('thresholds').compact.first || {}
    end

    def equiped_traits_bonuses
      item_bonuses.pluck('traits').compact.first || {}
    end

    def equiped_items_info
      @equiped_items_info ||=
        __getobj__
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .pluck('items.info')
    end

    def weapons
      __getobj__
        .items
        .joins(:item)
        .where(items: { kind: ['primary weapon', 'secondary weapon'] })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info', :notes, :ready_to_use)
    end

    def bonuses
      @bonuses ||= __getobj__.bonuses.pluck(:value)
    end

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
