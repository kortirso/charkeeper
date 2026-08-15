# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Feats
        class AddCommand < BaseCommand
          include Deps[
            refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
          ]

          KINDABLE_OPTIONS = %w[static_list many_from_list].freeze

          # rubocop: disable Metrics/BlockLength
          use_contract do
            Origins =
              Dry::Types['strict.string'].enum(
                'ancestry', 'class', 'subclass', 'community', 'character', 'transformation', 'domain_card'
              )
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden', 'static_list', 'many_from_list')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')
            WeaponKinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon')
            Traits = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')
            Ranges = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far', 'very far')
            DamageTypes = Dry::Types['strict.string'].enum('physical', 'magic')
            Types = Dry::Types['strict.string'].enum('spell', 'ability', 'grimoire')

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              optional(:slug).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 1_000)
                optional(:ru).maybe(:string, max_size?: 1_000)
                optional(:es).maybe(:string, max_size?: 1_000)
              end
              required(:origin).filled(Origins)
              optional(:origin_value).maybe(:string)
              required(:kind).filled(Kinds)
              optional(:limit).filled(:integer)
              optional(:limit_refresh).filled(Limits)
              optional(:modifiers).hash
              optional(:conditions).hash
              optional(:subclass_mastery).filled(:integer)
              optional(:level).filled(:integer)
              optional(:no_refresh).filled(:bool)
              optional(:continious).filled(:bool)
              optional(:type).filled(Types)
              optional(:recall).filled(:integer, gteq?: 0, lteq?: 10)
              optional(:tokens).hash do
                optional(:limit).filled(:string)
                optional(:reset_at).filled(:string)
                optional(:reset).filled(:string)
                optional(:reset_at_long).filled(:string)
              end
              optional(:price).hash do
                optional(:stress).filled(:integer, gteq?: 1, lteq?: 10)
                optional(:hope).filled(:integer, gteq?: 1, lteq?: 10)
              end
              optional(:exclude).maybe(:array).each(:string, :uuid_v4?)
              optional(:hope_dice).filled(:string)
              optional(:fear_dice).filled(:string)
              optional(:attacks).maybe(:array).each(:hash) do
                required(:kind).filled(WeaponKinds)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                required(:info).hash do
                  required(:burden).filled(:integer, gteq?: 1, lteq?: 2)
                  required(:tier).filled(:integer, gteq?: 1, lteq?: 4)
                  required(:trait).maybe(Traits)
                  required(:range).filled(Ranges)
                  required(:damage_type).filled(DamageTypes)
                  required(:damage).filled(:string)
                  required(:damage_bonus).filled(:integer, gteq?: 0, lteq?: 20)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 250)
                    optional(:ru).maybe(:string, max_size?: 250)
                    optional(:es).maybe(:string, max_size?: 250)
                  end
                end
              end
              optional(:options).maybe(:array).each(:hash) do
                required(:title).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                optional(:feature).maybe(:hash)
              end
            end

            rule(:type) do
              key.failure(:filled?) if values[:origin] == 'domain_card' && values[:origin_value].present? && value.blank?
            end

            rule(:recall) do
              key.failure(:filled?) if values[:origin] == 'domain_card' && values[:origin_value].present? && value.blank?
            end

            rule(:level) do
              key.failure(:filled?) if values[:origin] == 'domain_card' && values[:origin_value].present? && value.blank?
            end

            rule(:subclass_mastery) do
              key.failure(:filled?) if values[:origin] == 'subclass' && values[:origin_value].present? && value.blank?
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input)
            if input.key?(:options)
              input[:options].each do |option|
                slug = SecureRandom.uuid
                feature = option[:feature]
                next unless feature

                feature[:user] = input[:user]
                feature[:origin] = input[:origin]
                feature[:origin_value] = ''
                feature[:conditions] = { selected_feature: slug }

                raw_errors = add_feat_command.validate_all(feature)[:raw_errors]
                return raw_errors if raw_errors
              end
            end

            nil
          end

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
            input[:slug] ||= SecureRandom.uuid
            input[:info] = { hope_dice: input[:hope_dice], fear_dice: input[:fear_dice] }
            input[:conditions] ||= {}
            if input[:origin] == 'subclass' && input.key?(:subclass_mastery)
              input[:conditions][:subclass_mastery] = input[:subclass_mastery]
            end
            if input[:origin] == 'domain_card'
              input[:conditions][:level] = input[:level]
              input[:info][:type] = input[:type]
              input[:info][:recall] = input[:recall]
            end

            input[:options] =
              if input.key?(:options) && KINDABLE_OPTIONS.include?(input[:kind])
                input[:options].each_with_object({}) do |option, acc|
                  slug = SecureRandom.uuid
                  feature = option[:feature]
                  next acc[slug] = option unless feature

                  feature[:slug] = slug
                  feature[:user] = input[:user]
                  feature[:origin] = input[:origin]
                  feature[:origin_value] = ''
                  feature[:conditions] = { selected_feature: slug }

                  acc[slug] = { title: option[:title], feature: feature }
                end
              end

            input[:info] = input[:info].compact
            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
            result = ::Daggerheart::Feat.create!(
              input.except(
                :limit, :no_refresh, :subclass_mastery, :level, :attacks, :skip_contract_validation, :type, :recall,
                :hope_dice, :fear_dice, :options
              ).merge(options: input[:options]&.transform_values { |value| value[:title] })
            )

            if input.key?(:attacks)
              input[:attacks].each do |attack|
                add_weapon_command.call(attack.merge(user: input[:user], itemable: result))
              end
            end

            input[:options]&.values&.each do |option|
              next unless option[:feature]

              add_feat_command.call(**option[:feature])
            end

            unless input.key?(:no_refresh)
              input[:user].characters.daggerheart.find_each { |character| refresh_feats.call(character: character) }
            end

            { result: result }
          end

          def add_weapon_command = HomebrewsV2Context::Import::Daggerheart::Items::Weapons::AddCommand.new
          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.daggerheart.feats.add')
        end
      end
    end
  end
end
