# frozen_string_literal: true

module Dnd2024Character
  class BaseDecorator < ApplicationDecorator
    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :species, :legacy, :main_class, :classes, :subclasses, :languages, :health, :abilities, :level,
             :selected_features, :resistance, :immunity, :vulnerability, :energy, :coins, :money, :darkvision,
             :weapon_core_skills, :weapon_skills, :armor_proficiency, :music, :spent_spell_slots, :conditions,
             :hit_dice, :spent_hit_dice, :death_saving_throws, :selected_feats, :beastform, :background, :selected_beastforms,
             :weapon_mastery, :size, :speed, :speeds, :selected_skills, :tools, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def available_talents
      @available_talents ||= (level / 4) + 1 + (level >= 19 ? 1 : 0)
    end

    def proficiency_bonus
      @proficiency_bonus ||=
        2 +
        ((level - 1) / 4) +
        static_item_bonuses.pluck('proficiency').sum(&:to_i) +
        bonuses.pluck('proficiency_bonus').sum(&:to_i) +
        dynamic_bonuses.pluck('proficiency_bonus').sum(&:to_i)
    end

    def modified_abilities = abilities
    def features = []
    def static_spells = {}
    def spell_classes = {}
    def armor_class = 0
    def initiative = 0

    def defense_gear
      @defense_gear ||= begin
        armor, shield = equiped_armor_items
        {
          armor: armor.blank? ? nil : armor[0],
          shield: shield.blank? ? nil : shield[0]
        }
      end
    end

    def attacks_per_action
      @attacks_per_action ||= 1
    end

    def resistances
      {
        resistance: resistance,
        immunity: immunity,
        vulnerability: vulnerability
      }
    end

    def static_item_bonuses
      @static_item_bonuses ||= item_bonuses.pluck(:value).compact
    end

    def item_bonuses
      @item_bonuses ||= Character::Bonus.where(bonusable_id: __getobj__.items.active_states.pluck(:item_id)).to_a
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

    def weapons
      __getobj__
        .items
        .joins(:item)
        .where(items: { kind: 'weapon' })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info', :quantity, :notes, :state)
    end

    def bonuses
      @bonuses ||= __getobj__.bonuses.pluck(:value).compact
    end

    def dynamic_bonuses
      @dynamic_bonuses ||= __getobj__.bonuses.pluck(:dynamic_value).compact
    end
  end
end
