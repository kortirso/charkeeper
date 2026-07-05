# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Specialities
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            cache: 'cache.daggerheart_names'
          ]

          # rubocop: disable Metrics/BlockLength
          use_contract do
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')
            WeaponKinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon')
            Traits = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')
            Ranges = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far', 'very far')
            DamageTypes = Dry::Types['strict.string'].enum('physical', 'magic')
            Damages = Dry::Types['strict.string'].enum('d4', 'd6', 'd8', 'd10', 'd12', 'd20')

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              required(:domains).filled(:array, size?: 2).each(:string)
              required(:evasion).filled(:integer, gteq?: 1, lteq?: 20)
              required(:health_max).filled(:integer, gteq?: 1, lteq?: 10)
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash) do
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
                required(:kind).filled(Kinds)
                optional(:limit).filled(:integer, gteq?: 0)
                optional(:limit_refresh).filled(Limits)
                optional(:modifiers).hash
                optional(:price).hash do
                  optional(:stress).filled(:integer, gteq?: 1, lteq?: 10)
                  optional(:hope).filled(:integer, gteq?: 1, lteq?: 10)
                end
                optional(:continious).filled(:bool)
                optional(:tokens).hash do
                  optional(:limit).filled(:string)
                  optional(:reset_at).filled(:string)
                  optional(:reset).filled(:string)
                end
                optional(:exclude).filled(:array).each(:string, :uuid_v4?)
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
                    required(:trait).filled(Traits)
                    required(:range).filled(Ranges)
                    required(:damage_type).filled(DamageTypes)
                    required(:damage).filled(Damages)
                    required(:damage_bonus).filled(:integer, gteq?: 0, lteq?: 20)
                    optional(:features).maybe(:array).each(:hash) do
                      required(:en).filled(:string, max_size?: 250)
                      optional(:ru).maybe(:string, max_size?: 250)
                      optional(:es).maybe(:string, max_size?: 250)
                    end
                  end
                end
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:domains, :evasion, :health_max)
          end

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              speciality = ::Daggerheart::Homebrews::Speciality.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.merge({
                    user: input[:user], origin: 'class', origin_value: speciality.id, no_refresh: true
                  })
                )
              end
              speciality
            end

            cache.push_item(key: :classes, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
