# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Upgrade
      class PerformCommand < BaseCommand
        include Deps[add_character_item: 'commands.characters_context.items.add']

        WEAPON_KINDS = ['primary weapon', 'secondary weapon'].freeze
        WEAPON_KEYS = %i[charm stone gem].freeze
        ARMOR_KINDS = %w[armor].freeze
        ARMOR_KEYS = %i[armor_stone].freeze

        use_contract do
          config.messages.namespace = :daggerheart_item_upgrade

          params do
            required(:character).filled(type?: ::Daggerheart::Character)
            required(:character_item).filled(type?: ::Character::Item)
            required(:name).filled(:string, max_size?: 50)
            required(:state).filled(:string)
            required(:upgrades).hash
          end

          rule(:upgrades) do
            key.failure(:empty) if value.blank?
          end

          rule(:character_item, :upgrades) do
            item = values[:character_item].item

            if WEAPON_KINDS.include?(item.kind)
              key(:upgrades).failure(:invalid_key) if values[:upgrades].keys.any? { |key| WEAPON_KEYS.exclude?(key) }
              key(:upgrades).failure(:feature_exist) if values[:upgrades].key?(:stone) && item.info['features'].present?
            end

            if ARMOR_KINDS.include?(item.kind)
              key(:upgrades).failure(:invalid_key) if values[:upgrades].keys.any? { |key| ARMOR_KEYS.exclude?(key) }
              key(:upgrades).failure(:feature_exist) if values[:upgrades].key?(:armor_stone) && item.info['features'].present?
            end
          end
        end

        private

        def do_prepare(input) # rubocop: disable Metrics/AbcSize
          input[:attributes] =
            input[:character_item].item.attributes.except('id', 'name', 'slug', 'created_at', 'updated_at').merge(
              user_id: input[:character].user,
              slug: SecureRandom.uuid,
              name: { en: input[:name], ru: input[:name] }
            )

          input[:upgrades].each do |key, value|
            case key
            when :gem then update_by_gem(input, value)
            else update_by_feature(input, value)
            end
          end

          input[:states] =
            input[:character_item].states.merge({ input[:state] => input[:character_item].states[input[:state]] - 1 })
        end

        def do_persist(input)
          result = ActiveRecord::Base.transaction do
            item = ::Daggerheart::Item.create!(input[:attributes])
            add_character_item.call(character: input[:character], item: item, state: input[:state])
            update_old_item(input)
            item
          end

          { result: result }
        end

        def update_by_gem(input, value)
          upgrade = ::Daggerheart::Item.where(kind: 'upgrade').find_by(id: value)
          return unless upgrade

          input[:attributes].deep_merge!('info' => { 'trait' => upgrade.info['trait'] })
        end

        def update_by_feature(input, value)
          upgrade = ::Daggerheart::Item.where(kind: 'upgrade').find_by(id: value)
          return unless upgrade

          input[:attributes].deep_merge!(
            'info' => { 'features' => (input.dig(:attributes, 'info', 'features') || []).push(upgrade.info['feature']) }
          )
        end

        def update_old_item(input)
          return input[:character_item].destroy if input[:states].values.sum.zero?

          input[:character_item].update(states: input[:states])
        end
      end
    end
  end
end
