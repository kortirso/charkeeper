# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopySubclassCommand < BaseCommand
      include Deps[
        add_speciality: 'commands.homebrew_context.daggerheart.add_speciality',
        add_subclass: 'commands.homebrew_context.daggerheart.add_subclass',
        add_feat: 'commands.homebrew_context.daggerheart.add_feat'
      ]

      use_contract do
        params do
          required(:subclass).filled(type?: ::Daggerheart::Homebrew::Subclass)
          required(:user).filled(type?: ::User)
          optional(:class_name).filled(:string)
        end
      end

      private

      # rubocop: disable Metrics/AbcSize
      def do_prepare(input)
        if input[:class_name].nil?
          input[:default] = ::Daggerheart::Character.class_info(input[:subclass].class_name)
          if input[:default].nil?
            speciality = ::Daggerheart::Homebrew::Speciality.find_by(id: input[:subclass].class_name)
            input[:class_attributes] =
              speciality.data.attributes.symbolize_keys.merge({ id: speciality.id, name: speciality.name, user: input[:user] })
          end
        end

        input[:subclass_attributes] =
          input[:subclass].data.attributes.symbolize_keys.merge({
            name: input[:subclass].name, user: input[:user]
          })
      end

      def do_persist(input)
        result = ActiveRecord::Base.transaction do
          origin_value = find_class_origin_value(input)

          if input[:class_attributes]
            speciality = add_speciality.call(input[:class_attributes].except(:id))[:result]
            # скопировать навыки класса
            input[:subclass].user.feats.where(origin: 2, origin_value: origin_value)
              .find_each do |feat|
                add_feat.call(feat_attributes(feat, speciality.id).merge({ user: input[:user] }))
              end
          end

          subclass =
            add_subclass.call(input[:subclass_attributes].merge({
              class_name: input[:class_attributes] ? speciality.id : origin_value
            }))[:result]
          # скопировать навыки подкласса
          input[:subclass].user.feats.where(origin: 3, origin_value: input[:subclass].id).find_each do |feat|
            add_feat.call(feat_attributes(feat, subclass.id).merge({ user: input[:user] }))
          end
          subclass
        end

        { result: result }
      end
      # rubocop: enable Metrics/AbcSize

      def find_class_origin_value(input)
        return input[:class_name] if input[:class_name]
        return input[:subclass].class_name if input[:default]

        input[:class_attributes][:id]
      end

      def feat_attributes(feat, origin_value)
        feat
          .attributes
          .slice('origin', 'kind', 'limit', 'limit_refresh', 'subclass_mastery')
          .symbolize_keys
          .merge({
            origin_value: origin_value,
            title: feat.title['en'],
            description: feat.description['en'],
            limit: feat.description_eval_variables['limit']
          }).compact
      end
    end
  end
end
