# frozen_string_literal: true

module Dc20Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :abilities, :main_class, :level, :combat_expertise, :classes, :attribute_points, :ancestries, :skill_levels,
             :skill_expertise, :skill_points, :skill_expertise_points, :trade_points, :trade_expertise_points, :language_points,
             :trade_levels, :trade_expertise, :trade_knowledge, :language_levels, :conditions, :stamina_points, :path_points,
             :paths, :mana_points, :maneuvers, :rest_points, :path, :spell_list, :talent_points, :speeds, to: :data

    def parent = __getobj__

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def modified_abilities
      @modified_abilities ||= abilities
    end

    def combat_mastery
      @combat_mastery ||= (level / 2.0).round + bonuses.pluck('combat_mastery').sum(&:to_i)
    end

    def mana_spend_limit
      @mana_spend_limit ||= (level / 2.0).round
    end

    def equiped_shield_info
      @equiped_shield_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::HANDS)
        .joins(:item)
        .where(items: { kind: 'shield' })
        .pick('items.info')
    end

    def max_health = 0
    def maneuver_points = 0
    def spell_lists_amount = 0
    def spells = 0
    def size = 'medium'

    def bonuses
      @bonuses ||= __getobj__.bonuses.enabled.pluck(:value).compact
    end

    def dynamic_bonuses
      @dynamic_bonuses ||= __getobj__.bonuses.enabled.pluck(:dynamic_value).compact
    end

    def damages
      []
    end

    # DEPRECATED
    def cantrips = 0
  end
end
