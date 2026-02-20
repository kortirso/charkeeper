# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :heritage, :main_class, :classes, :subclasses, :level, :spent_armor_slots, :health_marked, :stress_marked,
             :hope_marked, :traits, :money, :gold, :subclasses_mastery, :experiences, :community, :stance, :selected_stances,
             :leveling, :experience, :heritage_features, :domains, :beastform, :beast, :transformation,
             :selected_features, :conditions, :scars, to: :data

    def parent = __getobj__

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    # rubocop: disable Naming/PredicateMethod
    def use_max_trait_for_attack
      false
    end
    # rubocop: enable Naming/PredicateMethod

    def advantage_dice = 'd6'
    def disadvantage_dice = 'd6'

    def proficiency
      @proficiency ||=
        tier +
        leveling['proficiency'].to_i +
        bonuses.pluck('proficiency').sum(&:to_i) +
        static_feat_bonuses.pluck('proficiency').sum(&:to_i) +
        static_item_bonuses.pluck('proficiency').sum(&:to_i)
    end

    def modified_traits
      @modified_traits ||= traits
    end

    def base_armor_score
      @base_armor_score ||= equiped_armor_info&.dig('base_score') || 0
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

    def equiped_items_info
      @equiped_items_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .pluck('items.info', 'items.name', 'items.id')
    end

    def armor_equiped # rubocop: disable Naming/PredicateMethod
      !equiped_armor_info.nil?
    end

    def weapon_equiped # rubocop: disable Naming/PredicateMethod
      equiped_weapon_info.any?
    end

    def tier
      return 4 if level >= 8
      return 3 if level >= 5
      return 2 if level >= 2

      1
    end

    def bonuses
      @bonuses ||= __getobj__.bonuses.enabled.pluck(:value).compact
    end

    def dynamic_bonuses
      @dynamic_bonuses ||= __getobj__.bonuses.enabled.pluck(:dynamic_value).compact
    end

    def static_feat_bonuses
      @static_feat_bonuses ||= feat_bonuses.pluck(:value).compact
    end

    def static_item_bonuses
      @static_item_bonuses ||= item_bonuses.pluck(:value).compact
    end

    def feat_bonuses
      @feat_bonuses ||= Character::Bonus.where(bonusable_id: __getobj__.feats.pluck(:feat_id)).to_a
    end

    def item_bonuses
      @item_bonuses ||= Character::Bonus.where(bonusable_id: __getobj__.items.active_states.pluck(:item_id)).to_a
    end

    def attack
      0
    end
  end
end
