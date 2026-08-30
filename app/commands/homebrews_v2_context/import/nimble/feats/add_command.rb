# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Feats
        class AddCommand < BaseCommand
          KINDABLE_OPTIONS = %w[static_list many_from_list].freeze

          # rubocop: disable-next Metrics/BlockLength
          use_contract do
            Origins = Dry::Types['strict.string'].enum('ancestry')
            Kinds = Dry::Types['strict.string'].enum(
              'static', 'text', 'update_result', 'hidden', 'one_from_list', 'many_from_list'
            )
            Limits = Dry::Types['strict.string'].enum('combat_rest', 'field_rest', 'long_field_rest', 'safe_rest')

            params do
              required(:user).filled(type?: ::User)
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
              required(:origin_value).filled(:string)
              required(:kind).filled(Kinds)
              optional(:limit).filled(:string)
              optional(:limit_refresh).filled(Limits)
              optional(:modifiers).hash
              optional(:continious).filled(:bool)
              optional(:exclude).maybe(:array).each(:string, :uuid_v4?)
              optional(:conditions).hash
              optional(:options).maybe(:array).each(:hash) do
                required(:title).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                optional(:feature).maybe(:hash)
              end
            end
          end

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

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
            input[:slug] ||= SecureRandom.uuid
            input[:info] = {}
            input[:info][:limit] = input[:limit] if input.key?(:limit)

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

            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result = ::Nimble::Feat.create!(
              input
                .except(:limit, :skip_contract_validation, :options)
                .merge(options: input[:options]&.transform_values { |value| value[:title] })
            )

            input[:options]&.values&.each do |option|
              next unless option[:feature]

              add_feat_command.call(**option[:feature])
            end

            { result: result }
          end

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.nimble.feats.add')
        end
      end
    end
  end
end
