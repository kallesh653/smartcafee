const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    default: 'Juicy'
  },
  shopTagline: {
    type: String,
    default: 'Delicious treats just a tap away'
  },
  shopAddress: {
    type: String,
    default: ''
  },
  shopMobile: {
    type: String,
    default: ''
  },
  shopEmail: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  billPrefix: {
    type: String,
    default: 'BILL'
  },
  billStartNumber: {
    type: Number,
    default: 1
  },
  currentBillNo: {
    type: Number,
    default: 0
  },
  gstEnabled: {
    type: Boolean,
    default: false
  },
  defaultGstPercent: {
    type: Number,
    default: 5
  },
  thermalPrinterSettings: {
    printerName: {
      type: String,
      default: 'ThermalPrinter'
    },
    paperWidth: {
      type: Number,
      default: 48
    },
    enableLogo: {
      type: Boolean,
      default: false
    },
    footerText: {
      type: String,
      default: 'Thank You! Visit Again'
    }
  },
  defaultPermissions: {
    userCanEditPrice: {
      type: Boolean,
      default: false
    },
    userCanGiveDiscount: {
      type: Boolean,
      default: true
    },
    maxUserDiscount: {
      type: Number,
      default: 10
    }
  },
  menuSlides: [{
    type: {
      type: String,
      enum: ['image', 'video', 'text'],
      default: 'image'
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    icon: {
      type: String,
      default: ''
    }
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
