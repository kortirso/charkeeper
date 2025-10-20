# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :heritage, :main_class, :classes, :subclasses, :level, :gold, :spent_armor_slots, :health_marked, :stress_marked,
             :hope_marked, :traits, :total_gold, :subclasses_mastery, :experiences, :community, :stance, :selected_stances,
             :leveling, :experience, :heritage_name, :heritage_features, :domains, :beastform, :transformation,
             :selected_features, to: :data

    def parent = __getobj__

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def modified_traits
      @modified_traits ||= traits
    end

    def base_armor_score
      @base_armor_score ||= equiped_armor_info&.dig('bonuses', 'base_score') || 0
    end

    def base_damage_thresholds
      @base_damage_thresholds ||= { 'major' => 0, 'severe' => equiped_armor_info ? 0 : level }
    end

    def selected_domains
      @selected_domains ||= __getobj__.selected_domains
    end

    def evasion
      @evasion ||= data.evasion
    end

    def transformations
      user_homebrew.dig('daggerheart', 'transformations')
    end

    def homebrew_domains
      user_homebrew.dig('daggerheart', 'domains')
    end

    def user_homebrew
      @user_homebrew ||= __getobj__.user.user_homebrew&.data || {}
    end

    def equiped_armor_info
      @equiped_armor_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .where(items: { kind: 'armor' })
        .pick('items.info')
    end

    def equiped_weapon_info
      @equiped_weapon_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::HANDS)
        .joins(:item)
        .where(items: { kind: ['primary weapon', 'secondary weapon'] })
        .pluck('items.info')
    end

    def armor_equiped?
      !equiped_armor_info.nil?
    end

    def weapon_equiped?
      equiped_weapon_info.any?
    end
  end
end
